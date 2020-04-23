import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { TaskStatus, Task } from '~/api/linguo';
import RemainingTime from '~/components/RemainingTime';
import { HourGlassIcon } from '~/components/icons';

const StyledHourGlassIcon = styled(HourGlassIcon)``;

const StyledTaskDeadline = styled.div`
  display: flex;
  align-items: center;
  color: ${p => p.theme.color.text.default};
  font-size: ${p => p.theme.fontSize.lg};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }

  ${StyledHourGlassIcon} {
    margin-right: 0.5rem;
  }
`;

function TaskDeadline(task) {
  const currentDate = new Date();

  const timeout = Task.isPending(task)
    ? Task.remainingTimeForSubmission(task, { currentDate })
    : task.status === TaskStatus.AwaitingReview
    ? Task.remainingTimeForReview(task, { currentDate })
    : undefined;

  if (timeout === undefined) {
    return null;
  }

  return (
    <RemainingTime
      initialValueSeconds={timeout}
      render={({ formattedValue, endingSoon }) => (
        <StyledTaskDeadline
          className={clsx({
            'ending-soon': endingSoon,
          })}
        >
          <StyledHourGlassIcon />
          <span>{formattedValue}</span>
        </StyledTaskDeadline>
      )}
    />
  );
}

TaskDeadline.propTypes = {
  status: t.oneOf(Object.values(TaskStatus)).isRequired,
};

export default TaskDeadline;