Approve/Reject decision row — the human-in-the-loop moment that closes every agent draft.

```jsx
<ApprovalActions reason="Pending approval logged · Agent recommends. You decide."
  onApprove={...} onReject={...} />
<ApprovalActions state="approved" />
```

The approve button is the screen's one salmon signal. States: pending, approved, rejected.
