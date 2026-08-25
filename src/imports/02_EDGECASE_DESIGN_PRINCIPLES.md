# EdgeCase --- Design Principles

## Status

Authoritative non-negotiable design principles.

These principles constrain architecture and implementation decisions,
but do **not** prescribe a specific technical architecture.

If an implementation decision conflicts with these principles, the
decision must be reconsidered or explicitly justified.

------------------------------------------------------------------------

## DP-01 --- Exception First

EdgeCase exists to resolve cases that normal workflows cannot safely or
confidently resolve.

Do not dilute the product into a generic assistant.

------------------------------------------------------------------------

## DP-02 --- Outcome Over Conversation

The objective is a resolved case, not a convincing AI conversation.

A successful interaction ends in a verified business outcome or a
justified escalation.

------------------------------------------------------------------------

## DP-03 --- Evidence Before Action

Important actions must be based on sufficient relevant evidence.

The system should distinguish:

-   known facts;
-   inferred conclusions;
-   uncertainty;
-   conflicting evidence;
-   missing information.

It must not manufacture evidence to complete a workflow.

------------------------------------------------------------------------

## DP-04 --- Bounded Autonomy

Autonomy is valuable only inside explicit authority boundaries.

The system must know:

-   what it can do automatically;
-   what requires approval;
-   what it cannot do;
-   when it must escalate.

------------------------------------------------------------------------

## DP-05 --- Deterministic Critical Control

LLMs may reason, interpret and recommend.

Critical side effects must be governed by deterministic controls such
as:

-   authorization;
-   policy thresholds;
-   state validation;
-   schema validation;
-   permission checks.

Do not make the LLM the sole authority over irreversible or high-impact
actions.

------------------------------------------------------------------------

## DP-06 --- Human Decision Boundaries

Human involvement should represent an explicit authority boundary, not
simply an AI failure.

Humans should be brought in when:

-   risk is high;
-   policy requires approval;
-   evidence is materially ambiguous;
-   the action is irreversible;
-   the system lacks authority;
-   autonomous resolution is unsafe.

------------------------------------------------------------------------

## DP-07 --- Verification Is Part of Resolution

An attempted action is not a successful resolution.

The system must have a way to establish that the intended business
outcome occurred.

Prefer independent post-action verification over trusting the action
response alone.

------------------------------------------------------------------------

## DP-08 --- State Is System-Owned

Workflow state belongs to the application/control system.

An LLM should not be able to arbitrarily declare:

`RESOLVED`.

The system should determine state transitions according to explicit
rules.

------------------------------------------------------------------------

## DP-09 --- Minimal Agentism

Use multiple specialized reasoning components only when specialization
provides real value.

Do not create agents merely to increase agent count.

Every agent must have:

-   a distinct responsibility;
-   clear inputs;
-   clear outputs;
-   bounded authority;
-   explicit failure conditions.

------------------------------------------------------------------------

## DP-10 --- Tools Are Capabilities, Not Agents

A system such as shipment lookup, customer lookup, policy retrieval or
compensation execution should normally be treated as a tool/capability
rather than an artificial "agent" unless it genuinely requires
independent reasoning.

------------------------------------------------------------------------

## DP-11 --- Evidence-Based Explainability

The product should explain decisions using relevant:

-   evidence;
-   sources;
-   policies;
-   actions;
-   outcomes.

Do not expose or depend on private chain-of-thought.

The goal is an auditable decision record, not a transcript of hidden
reasoning.

------------------------------------------------------------------------

## DP-12 --- Graceful Escalation

Failure to resolve autonomously is an acceptable product outcome when
the system has a defensible reason.

Never hallucinate a resolution merely to avoid escalation.

A good escalation should state:

-   what was discovered;
-   what remains uncertain;
-   why autonomous resolution stopped;
-   what the human needs to decide/do next.

------------------------------------------------------------------------

## DP-13 --- Failure Is a First-Class Outcome

The product must account for:

-   missing evidence;
-   conflicting evidence;
-   policy conflict;
-   tool failure;
-   authorization failure;
-   rejected approval;
-   execution failure;
-   verification failure.

The system should fail visibly and safely.

------------------------------------------------------------------------

## DP-14 --- Freshworks/MCP Must Be Meaningful

For the hackathon implementation, Freshworks and MCP must contribute
materially to the product behavior.

Do not add them only for judging optics.

Freshworks' current platform explicitly positions Agent Studio and MCP
around contextual, governed agentic execution across systems.
citeturn0search0turn0search1

------------------------------------------------------------------------

## DP-15 --- Demonstrable Differentiation

A product claim should be demonstrated through observable system
behavior.

Examples:

-   "bounded autonomy" → approval boundary visibly triggers;
-   "evidence-driven" → relevant evidence is shown before action;
-   "verified outcome" → independent verification is shown;
-   "cross-system" → the workflow actually obtains context/action
    through connected systems.

Do not rely on architecture diagrams to prove capabilities.

------------------------------------------------------------------------

## DP-16 --- One Deep Workflow Beats Many Shallow Workflows

For the hackathon, prefer one complete, reliable exception-resolution
workflow over several incomplete scenarios.

This is an implementation principle, not a limitation on the product
vision.

------------------------------------------------------------------------

## DP-17 --- Demo Scope Must Not Reduce Product Value

Reduce:

-   number of scenarios;
-   number of integrations;
-   number of supported domains;
-   breadth of features.

Do **not** reduce:

-   product thesis;
-   architectural quality;
-   safety model;
-   extensibility;
-   core resolution loop;
-   meaningful agentic behavior.

The hackathon should be a vertical slice of the product, not a toy
approximation.

------------------------------------------------------------------------

## DP-18 --- Research Before Architecture

Implementation architecture should be selected after:

-   repository research;
-   platform research;
-   relevant prior-art analysis;
-   alternative comparison;
-   constraint analysis.

Do not choose a framework or architecture merely because it is familiar.

------------------------------------------------------------------------

## DP-19 --- Simplicity Must Be Justified

The simplest architecture that satisfies the product requirements is
preferred.

However, "simple" must not mean:

-   hardcoded;
-   fake;
-   non-extensible;
-   unable to demonstrate the core product thesis.

------------------------------------------------------------------------

## DP-20 --- Reliability Beats Feature Count

A smaller number of reliable capabilities is preferable to a larger
number of unreliable capabilities.

The system must have a complete critical path before optional features
are added.

------------------------------------------------------------------------

## DP-21 --- Product Architecture and Hackathon Implementation Are Different

The product may require a broad architecture.

The hackathon may implement only one vertical slice.

The engineering process must preserve clean boundaries so the
demonstration can evolve into the larger product rather than requiring a
rewrite.

------------------------------------------------------------------------

## DP-22 --- No Architecture Theatre

Do not introduce:

-   unnecessary agents;
-   unnecessary microservices;
-   unnecessary databases;
-   unnecessary event buses;
-   unnecessary abstractions;
-   unnecessary orchestration layers.

Every architectural element must have a demonstrated purpose.

------------------------------------------------------------------------

## DP-23 --- Measurable Outcomes

The system should make its value measurable where possible.

Examples:

-   time to resolution;
-   human effort avoided;
-   actions completed;
-   systems coordinated;
-   escalation rate;
-   verification success;
-   policy compliance.

------------------------------------------------------------------------

## DP-24 --- The Product Must Survive the Demo

A feature is not complete because it works once in development.

The critical path must be reproducible, observable and resilient enough
for live demonstration.
