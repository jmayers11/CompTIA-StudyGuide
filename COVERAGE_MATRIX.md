# CS0-004 subobjective coverage matrix

Generated 2026-11-28 from the application data, not from the README.

**Method.** Each of the 194 bullets in the CS0-004 objectives has a keyword pattern. An item counts toward a bullet when its text matches the pattern; for MC, PBQs and drills it must also be in the same domain. Keyword matching is approximate: an item can match a bullet it only touches on, and a well-covered idea phrased differently can be missed. The same logic runs live in the app's Readiness tab under **Coverage explorer**.

Columns: MC = objective-tagged multiple choice (core pool only, supplemental excluded); Scen = MC with a scenario-length stem (110+ characters); PBQ; Drill = Analyst Training; Case = Investigation stages; Rec = Recognition items; Notes = objective notes and CySA+ seed notes; Cards = flashcard lines from those notes.

Status rules: **Missing** = no MC, applied or recognition item. **Insufficient** = fewer than 3 MC and no applied item. **Adequate** = at least 3 MC, or at least 1 MC plus 1 applied item. **Strong** = at least 6 MC, at least 1 applied item and at least 1 note.

**Before the gap fill:** 89 Strong, 89 Adequate, 14 Insufficient, 2 Missing (Logging: retention; Log collection).

**Gap fill:** 48 new original scenario questions (rev 2026-11-cs4g), three per weak bullet. They go into the core pool, not into any fixed exam.

**After the gap fill and the AI in Security Operations module:** 102 Strong, 92 Adequate.

**After Phase 4 (22 applied drills for bullets that had only multiple choice):** 133 Strong, 61 Adequate. Every bullet now has at least one applied item (PBQ, drill or investigation stage).

Coverage of a bullet is not the same as its weight on the exam. CompTIA publishes domain weights, not bullet weights.

## 1.1

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Logging: ingestion | 6 | 5 | 1 | 1 | 0 | 1 | 8 | 8 | Strong |
| Logging: configuration | 3 | 2 | 0 | 1 | 0 | 0 | 3 | 4 | Adequate |
| Logging: integrity and security | 4 | 3 | 0 | 1 | 0 | 1 | 2 | 2 | Adequate |
| Logging: time synchronization | 9 | 9 | 3 | 1 | 0 | 0 | 5 | 3 | Strong |
| Logging: retention | 3 | 3 | 0 | 1 | 0 | 0 | 6 | 7 | Adequate |
| OS: system hardening | 8 | 7 | 2 | 1 | 1 | 0 | 13 | 10 | Strong |
| OS: file structure / critical files | 17 | 13 | 6 | 3 | 1 | 4 | 24 | 29 | Strong |
| OS: system processes | 11 | 9 | 3 | 3 | 2 | 3 | 12 | 14 | Strong |
| Architecture: cloud native | 4 | 4 | 0 | 1 | 0 | 0 | 4 | 6 | Adequate |
| Architecture: virtualization | 7 | 7 | 0 | 1 | 0 | 0 | 10 | 11 | Strong |
| Architecture: containerization | 5 | 4 | 0 | 0 | 1 | 3 | 17 | 21 | Adequate |
| Architecture: APIs | 13 | 13 | 2 | 2 | 1 | 0 | 22 | 36 | Strong |
| Device management: mobile | 6 | 5 | 0 | 1 | 0 | 1 | 9 | 8 | Strong |
| Device management: endpoint | 4 | 3 | 0 | 1 | 0 | 0 | 2 | 2 | Adequate |
| Network: ZTNA / zero trust | 6 | 6 | 0 | 1 | 0 | 0 | 3 | 4 | Strong |
| Network: SASE | 4 | 4 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |
| Network: hybrid cloud | 6 | 6 | 0 | 1 | 0 | 0 | 6 | 5 | Strong |
| IAM: PAM | 5 | 5 | 0 | 1 | 0 | 0 | 6 | 5 | Adequate |
| IAM: authentication and authorization methods | 29 | 28 | 3 | 3 | 7 | 6 | 29 | 51 | Strong |
| IAM: secrets management | 4 | 3 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |
| Encryption techniques | 38 | 33 | 6 | 9 | 8 | 6 | 41 | 70 | Strong |
| Data protection concepts | 6 | 6 | 2 | 0 | 2 | 0 | 17 | 15 | Strong |
| Critical infrastructure: OT/ICS/SCADA | 3 | 1 | 2 | 0 | 4 | 0 | 7 | 5 | Adequate |

## 1.2

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Network: rogue devices | 4 | 4 | 1 | 0 | 0 | 2 | 3 | 6 | Adequate |
| Network: enumeration | 13 | 13 | 1 | 2 | 0 | 3 | 27 | 32 | Strong |
| Network: anomalous activity | 10 | 10 | 5 | 3 | 0 | 3 | 9 | 9 | Strong |
| Network: unexpected ports | 4 | 4 | 1 | 1 | 0 | 1 | 5 | 3 | Adequate |
| Host: resource consumption | 5 | 5 | 3 | 3 | 3 | 0 | 7 | 7 | Adequate |
| Host: unauthorized software | 3 | 3 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |
| Host: suspicious/rogue processes | 5 | 5 | 1 | 0 | 0 | 0 | 2 | 2 | Adequate |
| Host: LOLBins and scripts | 7 | 5 | 0 | 2 | 2 | 1 | 6 | 5 | Strong |
| Host: file system changes | 3 | 3 | 0 | 1 | 0 | 0 | 4 | 2 | Adequate |
| Host: data exfiltration | 11 | 11 | 3 | 6 | 2 | 4 | 18 | 32 | Strong |
| Host: unauthorized configuration | 8 | 7 | 0 | 1 | 1 | 0 | 12 | 6 | Strong |
| Application: service disruption | 6 | 6 | 0 | 2 | 2 | 1 | 15 | 14 | Strong |
| Application: anomalous activity | 5 | 4 | 1 | 0 | 0 | 1 | 5 | 5 | Adequate |
| Cloud: anomalous activity / resource compromise | 7 | 7 | 0 | 0 | 2 | 0 | 3 | 3 | Strong |
| Social engineering: typosquatting | 7 | 4 | 0 | 1 | 1 | 2 | 2 | 1 | Strong |
| Social engineering: URL shorteners | 6 | 5 | 0 | 1 | 0 | 0 | 2 | 1 | Strong |
| Identity: IAM account compromise | 7 | 7 | 2 | 1 | 0 | 0 | 8 | 9 | Strong |
| Identity: unauthorized access | 3 | 3 | 3 | 2 | 1 | 3 | 10 | 15 | Adequate |
| Identity: impossible travel | 5 | 4 | 2 | 0 | 0 | 1 | 3 | 2 | Adequate |
| Email: BEC | 5 | 5 | 0 | 0 | 1 | 1 | 2 | 1 | Adequate |

## 1.3

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Tool: CyberChef / decoding | 10 | 9 | 1 | 2 | 2 | 1 | 14 | 19 | Strong |
| Tool: Wireshark | 10 | 7 | 2 | 2 | 1 | 1 | 12 | 16 | Strong |
| Tool: tcpdump | 5 | 4 | 1 | 2 | 0 | 1 | 4 | 3 | Adequate |
| Tool: Snort / Suricata | 14 | 10 | 0 | 1 | 0 | 1 | 10 | 33 | Strong |
| Tool: Zeek | 6 | 6 | 1 | 2 | 0 | 1 | 5 | 14 | Strong |
| Tool: SIEM | 37 | 34 | 16 | 11 | 1 | 16 | 14 | 11 | Strong |
| Tool: threat intel platforms (OTX/MISP/OpenCTI) | 5 | 5 | 0 | 1 | 0 | 1 | 4 | 3 | Adequate |
| Tool: EDR / XDR | 27 | 24 | 7 | 4 | 5 | 2 | 12 | 12 | Strong |
| Tool: MDM | 6 | 5 | 0 | 1 | 0 | 0 | 4 | 3 | Strong |
| Tool: WHOIS / AbuseIPDB / GeoIP | 12 | 11 | 3 | 0 | 0 | 1 | 6 | 4 | Strong |
| Tool: strings | 10 | 9 | 1 | 0 | 0 | 1 | 11 | 22 | Strong |
| Tool: VirusTotal | 5 | 4 | 0 | 1 | 0 | 1 | 6 | 5 | Adequate |
| Tool: YARA | 6 | 5 | 1 | 0 | 0 | 1 | 5 | 11 | Strong |
| Tool: sandboxing (Joe/Cuckoo) | 18 | 15 | 2 | 0 | 1 | 1 | 12 | 17 | Strong |
| Pattern recognition: regular expressions | 3 | 2 | 0 | 1 | 0 | 0 | 5 | 4 | Adequate |
| Interpreting suspicious commands | 7 | 7 | 4 | 2 | 1 | 1 | 3 | 2 | Strong |
| Tool: MXToolbox / email analysis | 5 | 5 | 1 | 0 | 2 | 1 | 4 | 5 | Adequate |
| Tool: UEBA | 3 | 3 | 0 | 0 | 1 | 0 | 2 | 1 | Adequate |
| File formats: JSON/XML/YAML/EVTX | 15 | 11 | 0 | 0 | 1 | 3 | 16 | 29 | Strong |
| Scripting: Python / PowerShell / shell | 30 | 29 | 7 | 3 | 2 | 7 | 26 | 30 | Strong |

## 1.4

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Threat actors: APT | 8 | 8 | 1 | 0 | 1 | 0 | 9 | 10 | Strong |
| Threat actors: insider threat | 9 | 7 | 0 | 0 | 2 | 0 | 7 | 6 | Strong |
| TTPs | 6 | 5 | 1 | 0 | 1 | 2 | 11 | 13 | Strong |
| Heat maps | 4 | 4 | 0 | 1 | 0 | 1 | 2 | 1 | Adequate |
| Pyramid of Pain | 2 | 1 | 1 | 0 | 0 | 1 | 2 | 1 | Adequate |
| MITRE ATT&CK (TTP mapping) | 3 | 3 | 0 | 2 | 1 | 3 | 7 | 6 | Adequate |
| Attribution | 9 | 8 | 1 | 1 | 1 | 1 | 21 | 28 | Strong |
| Confidence: timeliness / relevance / accuracy | 22 | 19 | 2 | 2 | 4 | 4 | 35 | 26 | Strong |
| Collection: OSINT | 7 | 3 | 1 | 0 | 0 | 2 | 7 | 5 | Strong |
| Collection: closed-source intelligence | 5 | 3 | 0 | 1 | 0 | 1 | 2 | 1 | Adequate |
| Threat intelligence sharing | 7 | 7 | 2 | 3 | 2 | 3 | 5 | 5 | Strong |
| IoC collection / analysis / usage | 5 | 3 | 2 | 0 | 4 | 1 | 19 | 28 | Adequate |
| IoC types: atomic vs behavioral | 3 | 1 | 2 | 0 | 0 | 3 | 4 | 2 | Adequate |
| Threat modeling: STRIDE | 4 | 3 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |
| Threat mapping | 4 | 3 | 0 | 1 | 0 | 0 | 2 | 1 | Adequate |
| Cyber deception | 5 | 4 | 1 | 1 | 0 | 1 | 14 | 15 | Adequate |
| Threat hunting | 21 | 19 | 2 | 5 | 2 | 1 | 15 | 17 | Strong |

## 1.5

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Standardize: team coordination | 6 | 6 | 0 | 0 | 3 | 0 | 16 | 8 | Strong |
| Playbook / runbook creation | 19 | 17 | 5 | 0 | 0 | 2 | 11 | 8 | Strong |
| Automation and orchestration: SOAR | 37 | 33 | 2 | 9 | 1 | 4 | 50 | 77 | Strong |
| Infrastructure as code | 6 | 3 | 0 | 1 | 0 | 3 | 4 | 3 | Strong |
| Data enrichment | 10 | 9 | 3 | 2 | 0 | 1 | 5 | 7 | Strong |
| Rule / alert tuning | 4 | 3 | 2 | 1 | 1 | 1 | 16 | 11 | Adequate |
| Dashboard creation | 2 | 2 | 0 | 2 | 0 | 0 | 6 | 5 | Adequate |
| Integration: APIs / webhooks / plug-ins | 5 | 4 | 0 | 0 | 1 | 0 | 7 | 8 | Adequate |

## 1.6

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| AI risk: hallucinations | 10 | 8 | 3 | 2 | 3 | 2 | 2 | 1 | Strong |
| AI risk: data exposure | 6 | 6 | 2 | 1 | 1 | 2 | 2 | 2 | Strong |
| AI risk: model poisoning | 7 | 6 | 2 | 1 | 3 | 2 | 3 | 2 | Strong |
| AI risk: malicious prompts | 8 | 8 | 3 | 0 | 4 | 3 | 2 | 1 | Strong |
| AI governance: compliance / usage policy | 7 | 4 | 2 | 1 | 1 | 1 | 2 | 1 | Strong |
| AI use cases (artifacts/logs/docs/investigation/correlation/automation) | 49 | 36 | 8 | 4 | 8 | 20 | 5 | 8 | Strong |

## 2.1

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Asset inventory | 6 | 2 | 3 | 1 | 3 | 0 | 8 | 7 | Strong |
| Planning: scheduling / operations / performance | 11 | 7 | 2 | 1 | 4 | 4 | 15 | 16 | Strong |
| Planning: sensitivity levels / segmentation | 14 | 10 | 4 | 1 | 1 | 1 | 17 | 19 | Strong |
| Planning: regulatory requirements | 11 | 6 | 2 | 2 | 0 | 2 | 15 | 22 | Strong |
| Scan: internal vs external | 9 | 5 | 3 | 0 | 1 | 1 | 3 | 2 | Strong |
| Scan: agent vs agentless | 12 | 6 | 3 | 1 | 3 | 0 | 14 | 14 | Strong |
| Scan: credentialed vs non-credentialed | 14 | 11 | 4 | 2 | 1 | 1 | 2 | 1 | Strong |
| Scan: passive vs active | 10 | 8 | 2 | 1 | 1 | 0 | 3 | 2 | Strong |
| Discovery: mapping / device fingerprinting | 7 | 5 | 1 | 0 | 0 | 0 | 12 | 13 | Strong |
| Baseline scanning: PCI DSS / CIS / ISO 27000 | 9 | 5 | 0 | 1 | 0 | 0 | 7 | 9 | Strong |

## 2.2

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Network scanning: Angry IP / Masscan | 7 | 4 | 0 | 1 | 0 | 1 | 2 | 1 | Strong |
| Nmap output | 13 | 6 | 3 | 1 | 1 | 4 | 7 | 8 | Strong |
| Metasploit Framework | 5 | 4 | 1 | 0 | 0 | 2 | 3 | 2 | Adequate |
| Maltego / Recon-ng | 9 | 8 | 0 | 1 | 0 | 1 | 2 | 1 | Strong |
| Web app scanners: Burp / ZAP / Nikto | 17 | 12 | 1 | 0 | 0 | 5 | 3 | 3 | Strong |
| Vuln scanners: Nessus / Nuclei / OpenVAS | 10 | 6 | 2 | 1 | 1 | 4 | 2 | 2 | Strong |
| Cloud assessment: ScoutSuite / Prowler / Trivy / Checkov | 9 | 5 | 1 | 0 | 0 | 6 | 2 | 2 | Strong |
| BAS: Atomic Red Team / Caldera | 4 | 2 | 0 | 1 | 0 | 1 | 2 | 3 | Adequate |
| Scanner output interpretation | 76 | 56 | 12 | 10 | 2 | 6 | 31 | 31 | Strong |

## 2.3

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Criteria: exploitability | 15 | 8 | 4 | 0 | 0 | 2 | 11 | 9 | Strong |
| Criteria: active exploitation / threat intel | 8 | 7 | 3 | 3 | 1 | 0 | 6 | 2 | Strong |
| Criteria: asset value / impact | 16 | 8 | 0 | 2 | 1 | 0 | 10 | 9 | Strong |
| Criteria: patch / remediation availability | 5 | 3 | 0 | 0 | 2 | 0 | 1 | 2 | Adequate |
| Criteria: true/false positives | 13 | 10 | 4 | 2 | 1 | 2 | 14 | 11 | Strong |
| Criteria: true/false negatives | 7 | 5 | 2 | 1 | 0 | 1 | 2 | 2 | Strong |
| Scoring: CVSS metrics | 41 | 28 | 6 | 3 | 1 | 20 | 8 | 17 | Strong |
| Scoring: EPSS | 6 | 4 | 1 | 2 | 1 | 0 | 2 | 2 | Strong |
| Context awareness: internal / external / isolated | 18 | 15 | 7 | 4 | 3 | 0 | 19 | 16 | Strong |
| Mitigation: attack surface management | 8 | 7 | 0 | 2 | 0 | 0 | 11 | 12 | Strong |
| Mitigation: secure coding best practices | 11 | 8 | 0 | 1 | 0 | 0 | 6 | 7 | Strong |
| Mitigation: patching and configuration management | 57 | 41 | 11 | 3 | 5 | 3 | 32 | 51 | Strong |
| Mitigation: exceptions | 12 | 11 | 4 | 1 | 0 | 0 | 9 | 10 | Strong |
| Mitigation: compensating controls | 18 | 13 | 5 | 1 | 0 | 0 | 9 | 11 | Strong |
| Validation of remediation | 8 | 5 | 3 | 0 | 2 | 0 | 2 | 1 | Strong |
| Web vulns (LFI/RFI/injection/XSS) | 29 | 20 | 3 | 4 | 1 | 1 | 10 | 17 | Strong |

## 2.4

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Control types: administrative / technical / physical | 4 | 1 | 0 | 1 | 0 | 0 | 3 | 0 | Adequate |
| Control functions: preventative / detective / responsive / corrective | 7 | 4 | 1 | 0 | 0 | 0 | 5 | 3 | Strong |
| Risk: appetite / residual / inherent | 5 | 3 | 0 | 1 | 0 | 0 | 2 | 2 | Adequate |
| Risk strategies: accept / transfer / avoid / mitigate | 6 | 4 | 2 | 0 | 1 | 0 | 7 | 9 | Strong |
| Policies, governance and SLOs | 20 | 18 | 3 | 1 | 2 | 3 | 40 | 59 | Strong |
| AppSec: SAST | 9 | 8 | 2 | 0 | 0 | 0 | 9 | 8 | Strong |
| AppSec: DAST | 9 | 6 | 0 | 1 | 0 | 1 | 6 | 8 | Strong |
| AppSec: SAMM | 6 | 4 | 0 | 1 | 0 | 0 | 2 | 1 | Strong |
| Third-party: supply chain | 7 | 4 | 0 | 0 | 2 | 0 | 18 | 20 | Strong |
| Third-party: SCA | 7 | 5 | 0 | 1 | 0 | 0 | 3 | 2 | Strong |
| Third-party: SBOM | 3 | 1 | 0 | 0 | 2 | 0 | 2 | 1 | Adequate |

## 3.1

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Cyber Kill Chain | 20 | 11 | 0 | 2 | 0 | 0 | 3 | 4 | Strong |
| Diamond Model | 13 | 10 | 1 | 1 | 0 | 0 | 2 | 2 | Strong |
| MITRE ATT&CK framework | 23 | 13 | 1 | 1 | 1 | 3 | 7 | 6 | Strong |
| OSSTMM / OWASP testing frameworks | 4 | 4 | 0 | 1 | 0 | 1 | 4 | 4 | Adequate |

## 3.2

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| IR: preparation | 23 | 11 | 4 | 1 | 0 | 3 | 4 | 5 | Strong |
| IR: detection | 5 | 0 | 2 | 0 | 0 | 2 | 3 | 3 | Adequate |
| IR: analysis | 13 | 5 | 1 | 1 | 3 | 2 | 15 | 13 | Strong |
| IR: containment | 50 | 29 | 13 | 3 | 12 | 12 | 49 | 78 | Strong |
| IR: eradication | 25 | 13 | 8 | 1 | 2 | 2 | 8 | 10 | Strong |
| IR: recovery | 38 | 15 | 9 | 1 | 6 | 5 | 18 | 25 | Strong |
| IR: post-incident | 11 | 7 | 5 | 1 | 3 | 3 | 9 | 13 | Strong |

## 3.3

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Developing plans: IR plan / communication plan | 10 | 1 | 2 | 0 | 0 | 0 | 4 | 6 | Strong |
| Creating playbooks | 8 | 3 | 3 | 0 | 0 | 2 | 11 | 8 | Strong |
| Defining roles | 4 | 0 | 1 | 0 | 0 | 0 | 11 | 9 | Adequate |
| Training: tabletop / simulation | 9 | 5 | 3 | 0 | 0 | 1 | 2 | 2 | Strong |
| Log collection | 3 | 2 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |
| Log correlation | 7 | 1 | 1 | 1 | 0 | 2 | 24 | 26 | Strong |
| Log augmentation and enrichment | 5 | 3 | 0 | 1 | 0 | 1 | 5 | 7 | Adequate |
| Alerts and notifications | 27 | 13 | 6 | 1 | 13 | 6 | 36 | 39 | Strong |
| Triage | 4 | 1 | 1 | 0 | 2 | 1 | 8 | 6 | Adequate |
| Establishing a timeline | 14 | 7 | 3 | 3 | 1 | 2 | 12 | 7 | Strong |
| Determining severity and impact | 25 | 14 | 6 | 0 | 4 | 15 | 39 | 61 | Strong |
| Prioritization (incidents) | 6 | 3 | 1 | 0 | 2 | 0 | 19 | 18 | Strong |
| Evidence: chain of custody | 6 | 2 | 1 | 1 | 1 | 1 | 5 | 7 | Strong |
| Evidence: data integrity validation | 5 | 3 | 3 | 0 | 0 | 1 | 2 | 3 | Adequate |
| Evidence: preservation | 22 | 8 | 5 | 2 | 4 | 3 | 13 | 23 | Strong |
| Evidence: legal hold | 2 | 1 | 1 | 0 | 1 | 1 | 3 | 2 | Adequate |
| Isolating affected targets | 28 | 14 | 15 | 3 | 4 | 3 | 32 | 42 | Strong |
| Escalation | 10 | 4 | 7 | 0 | 3 | 3 | 29 | 36 | Strong |
| Remediation and verification | 2 | 1 | 4 | 1 | 3 | 3 | 17 | 31 | Adequate |
| Release from isolation | 3 | 0 | 0 | 1 | 0 | 0 | 2 | 1 | Adequate |
| Performing restoration | 22 | 7 | 8 | 1 | 4 | 2 | 13 | 9 | Strong |
| Root cause analysis | 14 | 6 | 2 | 1 | 2 | 1 | 8 | 5 | Strong |
| Corrective action development | 5 | 3 | 0 | 1 | 0 | 0 | 3 | 2 | Adequate |

## 4.1

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Vulnerability scan reports | 14 | 8 | 1 | 0 | 0 | 0 | 5 | 6 | Strong |
| Compliance findings | 6 | 3 | 0 | 1 | 0 | 0 | 2 | 1 | Strong |
| Risk scorecards | 5 | 2 | 0 | 1 | 0 | 1 | 2 | 1 | Adequate |
| Action plans: escalation / dependencies | 11 | 5 | 0 | 1 | 0 | 0 | 5 | 6 | Strong |
| Inhibitors: contractual / governance | 19 | 17 | 3 | 3 | 3 | 2 | 12 | 10 | Strong |
| Inhibitors: business process interruption / degrading functionality | 10 | 7 | 1 | 2 | 1 | 0 | 11 | 11 | Strong |
| Inhibitors: legacy / proprietary systems | 8 | 5 | 4 | 1 | 0 | 0 | 22 | 23 | Strong |
| Inhibitors: patch availability | 3 | 2 | 0 | 0 | 1 | 0 | 1 | 1 | Adequate |
| Stakeholder identification and communication | 28 | 15 | 3 | 0 | 0 | 0 | 8 | 11 | Strong |
| Metrics/KPIs: trends / top risks / SLA | 56 | 27 | 4 | 3 | 2 | 16 | 18 | 22 | Strong |

## 4.2

| Subtopic | MC | Scen | PBQ | Drill | Case | Rec | Notes | Cards | Status |
|---|---|---|---|---|---|---|---|---|---|
| Incident declaration and escalation | 4 | 2 | 1 | 0 | 0 | 0 | 2 | 1 | Adequate |
| Executive summary | 45 | 27 | 7 | 5 | 11 | 3 | 17 | 15 | Strong |
| Communication plan: legal / PR / regulators / law enforcement / customers | 32 | 15 | 6 | 4 | 6 | 5 | 19 | 33 | Strong |
| Operational security awareness: communication channels | 4 | 3 | 0 | 1 | 0 | 1 | 4 | 3 | Adequate |
| Post-incident reporting: after action / lessons learned / RCA | 13 | 7 | 3 | 0 | 4 | 1 | 11 | 12 | Strong |
| Shift / incident handover | 2 | 0 | 0 | 0 | 1 | 0 | 5 | 2 | Adequate |
| Internal threat intelligence report | 6 | 3 | 0 | 1 | 0 | 0 | 4 | 3 | Strong |
| Metrics: alert volume / FP rate / TP rate | 7 | 1 | 1 | 0 | 0 | 3 | 8 | 5 | Strong |
| Metrics: MTTD / MTTR / mean time to close / remediate | 14 | 5 | 1 | 2 | 1 | 4 | 4 | 3 | Strong |
| Metrics: phishing click rate | 5 | 3 | 1 | 0 | 0 | 1 | 2 | 1 | Adequate |
