# EdgeCase --- Scope and Boundaries

## Status

Authoritative scope policy.

This document exists to prevent two opposite failures:

1.  building too much for the 24-hour hackathon;
2.  shrinking the project so aggressively that its product value
    disappears.

------------------------------------------------------------------------

## 1. The Core Rule

> **Reduce implementation breadth, not product value.**

The product vision remains broad.

The hackathon implementation is a narrow vertical slice.

------------------------------------------------------------------------

## 2. Product Scope

The long-term product is a general exception-resolution platform.

Potential domains:

-   customer service;
-   IT;
-   HR;
-   finance;
-   procurement;
-   vendor operations;
-   logistics.

Potential exception classes:

-   policy conflicts;
-   cross-system inconsistencies;
-   failed commitments;
-   ownership ambiguity;
-   missing information;
-   external dependency failures;
-   high-risk service actions;
-   verification failures.

These belong to the product vision.

They do not all need to be implemented now.

------------------------------------------------------------------------

## 3. Hackathon Scope

The hackathon should implement:

-   one primary domain;
-   one Golden Scenario;
-   one complete resolution loop;
-   a small number of meaningful integrations/tools;
-   bounded agentic reasoning;
-   one approval boundary;
-   at least one side-effecting action;
-   independent verification;
-   one controlled failure/escalation path;
-   a polished product experience.

------------------------------------------------------------------------

## 4. What Must Not Be Cut

The following are core product value and should survive scope pressure:

-   exception-resolution thesis;
-   evidence gathering;
-   meaningful reasoning;
-   bounded autonomy;
-   authorization/approval;
-   action execution;
-   verification;
-   escalation;
-   Freshworks relevance;
-   meaningful MCP use;
-   observable outcome.

------------------------------------------------------------------------

## 5. What Can Be Reduced

The following may be reduced to keep the build feasible:

-   number of scenarios;
-   number of domains;
-   number of integrations;
-   number of tools;
-   number of specialized reasoning components;
-   amount of analytics;
-   UI breadth;
-   optional voice functionality;
-   advanced memory;
-   advanced visualization.

------------------------------------------------------------------------

## 6. What Should Not Be Built Just for Complexity

Avoid adding something solely because it sounds impressive:

-   many agents;
-   complex graph infrastructure;
-   event streaming;
-   microservice decomposition;
-   generalized workflow builders;
-   generalized policy platforms;
-   large knowledge graphs;
-   long-term autonomous learning;
-   dozens of connectors.

Every additional system must have a clear product or demo justification.

------------------------------------------------------------------------

## 7. Product vs Hackathon Architecture

### Product architecture

Should be:

-   extensible;
-   modular;
-   domain-aware;
-   governed;
-   testable;
-   capable of supporting additional exception classes.

### Hackathon implementation

Should be:

-   narrow;
-   complete;
-   reliable;
-   demonstrable;
-   easy to recover if an external dependency fails.

The implementation should preserve interfaces that make future expansion
possible without pretending that every future capability already exists.

------------------------------------------------------------------------

## 8. Optional Capabilities

Voice, additional agents, analytics, extra integrations and additional
scenarios are optional.

They may be added only when:

1.  the core resolution path is stable;
2.  they strengthen the product thesis;
3.  they improve judge understanding or product value;
4.  they do not materially increase failure risk.

------------------------------------------------------------------------

## 9. Scope Decision Rule

For every proposed feature ask:

### Question 1

Does it increase the probability that EdgeCase actually resolves the
Golden Scenario?

If no, it is not P0.

### Question 2

Does it materially strengthen the product's long-term value?

If no, it is probably optional.

### Question 3

Can it be implemented without threatening the critical path?

If no, defer it.

### Question 4

Does it add genuine differentiation or merely technical complexity?

Prefer differentiation.

------------------------------------------------------------------------

## 10. The Vertical-Slice Principle

The Golden Scenario is not a toy.

It is a complete slice through the real product:

``` text
Real Product Capability
        |
        v
+---------------------------+
| Golden Scenario            |
|                           |
| Case                      |
| Evidence                  |
| Reasoning                 |
| Policy                    |
| Authorization             |
| Action                    |
| Verification              |
| Escalation                |
+---------------------------+
```

The scenario should exercise real product principles even though its
domain coverage is narrow.

------------------------------------------------------------------------

## 11. Stage Strategy

### Before the hackathon

Prioritize:

-   product clarity;
-   prototype;
-   Golden Scenario;
-   architecture research;
-   platform feasibility;
-   technical risk reduction.

### During the 24-hour build

Prioritize:

1.  complete critical path;
2.  reliability;
3.  integration;
4.  verification;
5.  judge-facing UX;
6.  optional differentiators.

### After the critical path is stable

Consider:

-   richer evidence visualization;
-   controlled failure/recovery;
-   voice;
-   additional scenario;
-   additional integration.

------------------------------------------------------------------------

## 12. Definition of "Too Small"

The project has become too small if it is essentially:

-   chatbot + prompt;
-   RAG + answer;
-   ticket summarization;
-   static workflow;
-   fake tool calls;
-   hardcoded resolution disguised as AI;
-   no verification;
-   no meaningful external action.

------------------------------------------------------------------------

## 13. Definition of "Too Large"

The project has become too large if the team cannot reliably
demonstrate:

> **Exception → Investigation → Decision → Authorized Action →
> Verification**

within the available time.

------------------------------------------------------------------------

## 14. Scope North Star

> **A judge should see a small implementation and recognize a large
> product category behind it.**
