/** Approve / Reject decision row — every agent draft ends here.
 * @startingPoint section="Product" subtitle="The human-in-the-loop moment" viewport="700x120"
 */
export interface ApprovalActionsProps {
  /** The agent's rationale line shown beside the buttons */
  reason?: string;
  approveLabel?: string;
  rejectLabel?: string;
  state?: 'pending' | 'approved' | 'rejected';
  onApprove?: () => void;
  onReject?: () => void;
  style?: React.CSSProperties;
}
