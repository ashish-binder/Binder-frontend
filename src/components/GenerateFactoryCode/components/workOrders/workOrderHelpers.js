import { SIMPLE_REQUIREMENT_WORK_ORDERS } from '@/utils/workOrderOptions';

// A "simple requirement" work order only needs Testing Requirement + Approval
// (no machine/variant/design fields). Shared by Step2 and WorkOrdersSection.
export const isSimpleRequirementWorkOrder = (workOrderType) =>
  SIMPLE_REQUIREMENT_WORK_ORDERS.includes(workOrderType);
