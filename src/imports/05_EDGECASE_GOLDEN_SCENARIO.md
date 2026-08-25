# EdgeCase --- Golden Scenario

## Status

Authoritative demonstration scenario.

This is the concrete vertical slice used to validate the product thesis
and guide the initial implementation.

Engineering may refine exact data values and implementation details, but
changes must preserve the scenario's essential characteristics.

------------------------------------------------------------------------

## 1. Scenario Name

# The Broken Promise

------------------------------------------------------------------------

## 2. Scenario Thesis

A service case contains conflicting evidence, a previous customer
commitment, and a policy boundary.

The normal workflow cannot safely resolve it.

EdgeCase must investigate the case, reconcile the evidence, determine a
compliant resolution, obtain approval when necessary, execute the
resolution, and verify the outcome.

------------------------------------------------------------------------

## 3. Example Case

### Case ID

`EC-1042`

### Title

`Replacement promised but shipment disputed`

### Situation

A customer was promised a replacement device.

Connected systems contain:

-   an existing replacement order;
-   a shipment marked as delivered;
-   a customer claim that the package was not received;
-   a previous support commitment;
-   a policy that does not automatically authorize the desired
    compensation.

The case therefore does not fit a simple standard workflow.

------------------------------------------------------------------------

## 4. Why This Is an EdgeCase

The difficulty comes from the interaction of:

-   multiple evidence sources;
-   conflicting information;
-   historical context;
-   policy constraints;
-   customer impact;
-   a side-effecting resolution;
-   a need for verification.

The complexity must arise from the business problem, not artificial
technical complexity.

------------------------------------------------------------------------

## 5. Required Product Behavior

### A. Investigate

EdgeCase should obtain the relevant context.

Potential sources:

-   Freshworks case;
-   customer history;
-   order/replacement record;
-   shipment status;
-   policy/knowledge source;
-   previous commitment.

### B. Reconcile

EdgeCase should identify the important contradiction.

Example:

``` text
Shipment system:
DELIVERED

Customer history:
Customer disputes receipt
```

The system should not silently choose one source without considering the
conflict.

### C. Determine Policy

EdgeCase should identify:

-   applicable policy;
-   permitted resolution options;
-   approval requirements;
-   prohibited/unsafe actions.

### D. Plan

EdgeCase should produce a structured resolution proposal.

Example:

``` text
Proposed resolution:
- issue approved compensation/replacement
- update service case
- notify customer
```

Exact action values should come from the configured scenario policy, not
arbitrary hardcoding in the demo.

### E. Govern

If the proposed action crosses the configured authority boundary:

``` text
AWAITING APPROVAL
```

The user explicitly approves or rejects the action.

### F. Execute

The system performs the authorized side effect through a controlled
capability.

### G. Verify

The system independently checks whether the intended business state
occurred.

### H. Resolve

Only after verification succeeds:

``` text
RESOLVED
```

Otherwise:

``` text
ESCALATED
```

or a controlled re-plan/retry path.

------------------------------------------------------------------------

## 6. Required Demonstration Properties

The scenario should visibly demonstrate:

### Evidence

The system can show why it reached its conclusion.

### Conflict

The system encounters information that is not trivially consistent.

### Agentic reasoning

The system must choose what to investigate and what resolution to
propose.

### Bounded autonomy

At least one meaningful action should demonstrate an authorization
boundary.

### Action

The system must cause a real or controlled external state change.

### Verification

The system must prove the state change occurred.

### Failure handling

At least one controlled failure path should exist.

------------------------------------------------------------------------

## 7. Failure Demonstration

The implementation should support a deterministic verification failure.

Example:

``` text
Resolution executed
        ↓
Verification
        ↓
Expected state mismatch
        ↓
VERIFICATION FAILED
        ↓
Controlled re-plan or escalation
```

The purpose is to prove that EdgeCase does not blindly declare success.

This failure path must be reliable enough to demonstrate without
destabilizing the primary successful path.

------------------------------------------------------------------------

## 8. Scenario Success

The Golden Scenario succeeds when:

``` text
Case
  ↓
Evidence
  ↓
Conflict detected
  ↓
Policy evaluated
  ↓
Resolution proposed
  ↓
Approval if required
  ↓
Action executed
  ↓
Outcome independently verified
  ↓
RESOLVED
```

or, when appropriate:

``` text
Case
  ↓
Evidence
  ↓
Unresolvable condition
  ↓
JUSTIFIED ESCALATION
```

------------------------------------------------------------------------

## 9. What the Scenario Must Not Become

Do not add complexity merely to make the case look impressive.

Avoid:

-   unrelated departments;
-   unnecessary tools;
-   artificial multi-agent conversations;
-   dozens of policy rules;
-   arbitrary financial values;
-   fake external calls that have no effect;
-   hardcoded final answers presented as agent reasoning.

------------------------------------------------------------------------

## 10. Generalization Requirement

The Golden Scenario is one instance of the broader EdgeCase product.

The underlying product concepts should remain general:

``` text
Case
Evidence
Conflict
Policy
Resolution
Authorization
Action
Verification
Outcome
```

Do not design the entire product around "replacement laptop."

The laptop/replacement scenario is only the first proof.

------------------------------------------------------------------------

## 11. Judge-Facing Narrative

The scenario should be explainable in approximately 20 seconds:

> "This customer case cannot be resolved by the normal workflow. The
> shipment system says delivered, the customer disputes it, and a
> previous commitment conflicts with the current policy. EdgeCase
> investigates the evidence, determines the safe resolution, gets
> approval when necessary, performs the action, and verifies that the
> problem is actually resolved."

------------------------------------------------------------------------

## 12. Demo End State

The final screen should communicate:

``` text
EDGECASE

CASE #EC-1042

Exception detected
Evidence reconciled
Resolution authorized
Action completed
Outcome verified

✓ VERIFIED RESOLUTION
```

The user should also be able to inspect the evidence and action history.

------------------------------------------------------------------------

## 13. Scenario Evolution

After the Golden Scenario is stable, additional scenarios may be added
to prove generality.

Potential future scenarios:

-   payment/refund exception;
-   SLA promise exception;
-   access provisioning exception;
-   vendor delay exception;
-   cross-team ownership exception.

These are not required for the first implementation.
