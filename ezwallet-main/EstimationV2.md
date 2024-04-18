# Project Estimation - FUTURE

Date:

Version:

# Estimation approach

Consider the EZWallet project in FUTURE version (as proposed by the team), assume that you are going to develop the project INDEPENDENT of the deadlines of the course

# Estimate by size

###

|                                                                                                         | Estimate |
| ------------------------------------------------------------------------------------------------------- | -------- |
| NC = Estimated number of classes to be developed                                                        | 12       |
| A = Estimated average size per class, in LOC                                                            | 130      |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 1560     |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 156      |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 4680     |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 0.97     |

# Estimate by product decomposition

###

| component name       | Estimated effort (person hours) |
| -------------------- | ------------------------------- |
| requirement document | 40                              |
| GUI prototype        | 16                              |
| design document      | 7                               |
| code                 | 55                              |
| unit tests           | 16                              |
| api tests            | 21                              |
| management documents | 6                               |

# Estimate by activity decomposition

###

| Activity name                                                  | Estimated effort (person hours) |
| -------------------------------------------------------------- | ------------------------------- |
| Get to meet eachother                                          | 1                               |
| Read the project instructions                                  | 10                              |
| Meet discuss features to be added to V2 + split the work       | 6                               |
| Do the estimations                                             | 3                               |
| Do the Requirement document                                    | 40                              |
| Do the GUI prototype                                           | 16                              |
| Write code based on the Requirement document and GUI prototype | 55                              |
| Test user functionalities                                      | 15                              |
| Meet to review our work                                        | 12                              |

###

![Gantt_chart](images/GanttV2.png)
**Notes:** • The coding activity requires 4 days because no work is being done on Saturday and Sunday. \
• The activities which belong to the critical path are colored in red.

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |
| ---------------------------------- | ---------------- | ------------------ |
| estimate by size                   | 156 person hours | 0.97               |
| estimate by product decomposition  | 161 person hours | 1                  |
| estimate by activity decomposition | 158 person hours | 0.98               |

The main reason behind the differences in the 3 estimations is the amount of details taken into account in each one of them. For the "estimate by size", the estimate time for each LOC written implicitly contains the time required to actually write the code, plus the documentation, meetings... so it might not be accurate. The "Estimate by product decomposition" is a bit more detailed than the previous method and resulted in a greater estimated effort (161 person hours compared to 156). The "Estimate by activity decomposition" is the most detailed as each single activity is taken into account and resulted in an estimated effort which is in between the previous 2 estimates
(156 < 158 < 161)
