# EdgeCase --- Outcomes and Success Criteria

## Status

Authoritative definition of what EdgeCase must accomplish.

This document defines outcomes, not implementation mechanisms.

------------------------------------------------------------------------

## 1. North-Star Outcome

> **Convert a difficult enterprise exception into a traceable,
> policy-compliant, verified resolution --- or a justified escalation.**

------------------------------------------------------------------------

## 2. User Outcomes

A user should be able to:

1.  understand why a case is difficult;
2.  see the relevant evidence;
3.  understand what EdgeCase recommends;
4.  know what EdgeCase is authorized to do;
5.  approve or reject actions when required;
6.  see actions being executed;
7.  see whether the outcome was verified;
8.  understand why a case was escalated.

------------------------------------------------------------------------

## 3. System Outcomes

EdgeCase should be able to:

### Understand

Create a structured representation of the case.

### Investigate

Gather relevant context from connected systems.

### Reconcile

Detect contradictions and missing information.

### Reason

Apply relevant policies and constraints.

### Plan

Produce an actionable resolution plan.

### Govern

Determine what can be done autonomously and what requires approval.

### Act

Execute authorized side effects through controlled capabilities.

### Verify

Establish whether the intended business state actually occurred.

### Escalate

Stop safely when autonomous resolution is inappropriate.

------------------------------------------------------------------------

## 4. Resolution Definition

A case may enter `RESOLVED` only when:

-   required evidence has been collected;
-   the resolution is allowed;
-   required approval has been obtained;
-   required actions have executed;
-   required verification checks pass;
-   the final case state is consistent with the intended outcome.

Otherwise the case remains unresolved or enters an appropriate
escalation state.

------------------------------------------------------------------------

## 5. Failure Outcomes

Failure must be classified rather than hidden.

Possible outcomes:

-   `INSUFFICIENT_EVIDENCE`
-   `CONFLICTING_EVIDENCE`
-   `POLICY_CONFLICT`
-   `AUTHORIZATION_REQUIRED`
-   `ACTION_FAILED`
-   `VERIFICATION_FAILED`
-   `UNRESOLVABLE`
-   `HUMAN_ESCALATION`

Exact implementation states are an engineering decision, but the product
must preserve these distinctions.

------------------------------------------------------------------------

## 6. Product Metrics

### Primary

**Verified Resolution Rate**

Percentage of eligible cases that reach a verified resolution.

### Secondary

**Time to Resolution**

Elapsed time from case intake to verified outcome.

**Human Effort Avoided**

Estimated manual work removed from the resolution process.

**Correct Escalation Rate**

Percentage of cases correctly escalated when autonomous resolution is
unsafe.

**Action Success Rate**

Percentage of authorized actions successfully completed.

**Verification Success Rate**

Percentage of completed actions whose intended business outcome is
correctly verified.

**Policy Compliance**

Percentage of actions that remain within applicable policy/authority
constraints.

**Context Utilization**

Relevant systems/data sources successfully incorporated into resolution.

------------------------------------------------------------------------

## 7. Hackathon Success Criteria

The hackathon implementation should prove:

-   a genuinely difficult exception;
-   meaningful investigation;
-   evidence-based reasoning;
-   real tool/system interaction;
-   bounded autonomy;
-   human approval where appropriate;
-   a side-effecting action;
-   post-action verification;
-   a clear final outcome;
-   a safe failure/escalation path.

------------------------------------------------------------------------

## 8. Demo Success

A judge should be able to answer these questions after the demo:

1.  What was the problem?
2.  Why was the normal workflow insufficient?
3.  What did EdgeCase discover?
4.  What evidence supported the decision?
5.  What did the system decide to do?
6.  Why did it need or not need approval?
7.  What action did it perform?
8.  How did it verify the result?
9.  What happened when something went wrong?
10. What value did the user/business receive?

If the demo cannot answer these questions, the product experience is
incomplete.

------------------------------------------------------------------------

## 9. Product-Value Test

A feature should be considered valuable only if removing it would
materially weaken one or more of:

-   resolution quality;
-   safety;
-   trust;
-   speed;
-   measurable business outcome;
-   differentiation.

Features that only make the demo look technically complicated should be
deprioritized.

------------------------------------------------------------------------

## 10. Long-Term Success

Beyond the hackathon, EdgeCase should demonstrate that its core
resolution model can be reused across multiple exception classes and
service domains without redesigning the entire system.

The measure of architectural success is not the number of agents or
integrations.

It is:

> **How much additional exception-resolution capability can be added
> without breaking the core product model?**
