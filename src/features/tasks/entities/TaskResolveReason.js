import { Enum } from '~/shared/entities/utils';

/**
 * Task Status as represented in the smart contract.
 *
 * @readonly
 * @enum {number}
 */
const TaskResolveReason = Enum('TaskStatus', {
  RequesterReimbured: 'requester-reimbursed',
  TranslationAccepted: 'translation-accepted',
  DisputeSettled: 'dispute-settled',
});

export default TaskResolveReason;
