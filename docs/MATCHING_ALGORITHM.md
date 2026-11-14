# AlumiNet Matching Algorithm Specification

## Purpose
The AlumiNet matching engine (`server/services/matchingEngine.js`) algorithmically pairs current university students with graduated alumni who possess the exact skills and industry interests required to mentor them.

## Mathematical Formulation

### 1. Technical Skills Overlap (60% Weight)
The algorithm evaluates how much of the student's requested skill set is satisfied by the alumni mentor:

$$\text{Score}_{\text{skills}} = \left(\frac{|\text{Common Skills}|}{|\text{Student's Target Skills}|}\right) \times 60$$

### 2. Career & Domain Interests (40% Weight)
The algorithm computes domain intersectionality across career fields (e.g., AI/ML, Cloud, FinTech, Startups):

$$\text{Score}_{\text{interests}} = \left(\frac{|\text{Common Interests}|}{|\text{Student's Target Interests}|}\right) \times 40$$

### 3. Total Compatibility Score & Filtering
$$\text{Total Score} = \min(\text{round}(\text{Score}_{\text{skills}} + \text{Score}_{\text{interests}}), 99)$$

- **Threshold Cutoff:** Any alumni mentor scoring **below 70%** is completely filtered out.
- **Dynamic Re-calculation:** Computed live per request, ensuring zero stale-data artifacts when users update their profile competencies.
