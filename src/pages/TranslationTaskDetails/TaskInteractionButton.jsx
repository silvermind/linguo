import React from 'react';
import t from 'prop-types';
import { mutate } from 'swr';
import produce from 'immer';
import { TaskStatus } from '~/api/linguo';
import { useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import useStateMachine from '~/hooks/useStateMachine';
import wrapWithNotification from '~/utils/wrapWithNotification';
import Button from '~/components/Button';

const buttonStateMachine = {
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'pending',
      },
    },
    pending: {
      on: {
        SUCCESS: 'succeeded',
        ERROR: 'idle',
      },
    },
    succeeded: {
      final: true,
    },
  },
};

const TaskInteraction = {
  Assign: 'assign',
  Challenge: 'challenge',
  Accept: 'accept',
};

const interactionToApiMethodMap = {
  [TaskInteraction.Assign]: 'assignTask',
  [TaskInteraction.Challenge]: 'challengeTranslation',
  [TaskInteraction.Accept]: 'acceptTranslation',
};

const interactionToMutationMap = {
  [TaskInteraction.Assign]: produce(task => {
    task.status = TaskStatus.Assigned;
  }),
  [TaskInteraction.Challenge]: produce(task => {
    task.status = TaskStatus.DisputeCreated;
  }),
  [TaskInteraction.Accept]: produce(task => {
    task.status = TaskStatus.Finished;
  }),
};

const withNotification = wrapWithNotification({
  errorMessage: 'Failed to submit the transaction',
  successMessage: 'Transaction submitted sucessfuly',
  duration: 10,
});

function TaskInteractionButton({ ID, interaction, content, buttonProps }) {
  const apiMethod = interactionToApiMethodMap[interaction];
  const afterSuccess = interactionToMutationMap[interaction];

  const linguo = useLinguo();
  const { account } = useWeb3React();
  const [state, dispatch] = useStateMachine(buttonStateMachine);

  const disabled = state !== 'idle';

  const handleClick = React.useCallback(
    withNotification(async evt => {
      evt.preventDefault();

      try {
        dispatch('START');
        const result = await linguo.api[apiMethod]({ ID }, { from: account });
        await mutate(['getTaskById', ID], mutate(afterSuccess));
        dispatch('SUCCESS');
        return result;
      } catch (err) {
        dispatch('ERROR');
        throw err;
      } finally {
      }
    }),
    [dispatch, linguo.api, apiMethod, ID, account, history, location]
  );

  return (
    <Button {...buttonProps} disabled={disabled} onClick={handleClick}>
      {content[state]}
    </Button>
  );
}

TaskInteractionButton.propTypes = {
  ID: t.number.isRequired,
  interaction: t.oneOf(Object.values(TaskInteraction)).isRequired,
  content: t.shape({
    idle: t.node.isRequired,
    pending: t.node.isRequired,
    succeeded: t.node.isRequired,
  }).isRequired,
  buttonProps: t.object,
};

TaskInteractionButton.defaultProps = {
  buttonProps: {},
};

TaskInteractionButton.Interaction = TaskInteraction;

export default TaskInteractionButton;
