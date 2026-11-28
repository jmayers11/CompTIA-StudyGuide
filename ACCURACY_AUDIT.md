# Technical accuracy audit (Phase 3, P1)

Date: 2026-11-28. Scope: the CySA+ track, plus shared recognition data, the ports table and the seed notes.

**What this is.** An automated cross-check plus one reviewer's manual sample. The reviewer was the AI assistant that also wrote much of the content, so this is **not** an independent expert validation. Each classification below is a judgment, and the sources named are the ones that were actually consulted.

## 1. Automated cross-checks

The scripts are in `outputs/p1` (scan_eid.py, scan_ports.py, cvss.py, attack.py). Each scan runs over the full application script.

| Check | What was compared | Result |
|---|---|---|
| Windows Security/System Event IDs | Every mention of 40 common IDs (4624, 4625, 4688, 4769, 1102, 7045 and others) against an expected-meaning keyword list. 111 contexts were flagged and reviewed by hand. | Most flags were option lists or query strings. **1 real error cluster** (Defender IDs, below) and 1 imprecise grouping. |
| Recognition: Event ID table | 25 Windows IDs and 8 Sysmon IDs in the Recognition data | All correct |
| Sysmon IDs in prose | Sysmon 1, 3, 7, 8, 10, 11, 13, 15, 22 against their documented event types | No errors |
| Ports table (Ports quiz) | 40 entries: ports and transport | No errors |
| Port claims in prose | "service (port N)" and "port N for service" patterns | 7 flags, all deliberate wrong-answer options |
| CVSS v3.x | Metric labels (AV/AC/PR/UI/S/C/I/A), severity bands, and each full vector recomputed with the v3.1 formula | 8 vectors found. No stated score contradicts the computed score. Severity bands are correct. |
| MITRE ATT&CK | 26 technique/tactic IDs (36 mentions) against technique names; the 19 tactic-recognition items against their tactics | 1 imprecision (PsExec), fixed |
| IR lifecycle | NIST SP 800-61 phase names and the r2/r3 framing | Correct. Chapple's CS0-004 study guide (ch. 9) confirms that the CS0-004 objectives use the 800-61r2 four-phase model and that r3 was published in 2025. |
| Exam format constants | CySA+: 85 questions maximum, 165 minutes, domain weights 34/26/24/16 (checked in an earlier session against the official objectives); PBQ counts per exam are not stated anywhere | Matches. The app already says that CompTIA does not publish the scoring conversion or PBQ weights. |

### Findings fixed

| # | Location | Classification | Before | After | Source |
|---|---|---|---|---|---|
| A1 | Seed note "Windows event IDs" (key terms and summary) and its practice question | **Incorrect** | 1118 = remediation started, 1119 = remediation succeeded, 1120 = remediation failed, 5001 = configuration changed | 1116 detected, 1117 action taken, 1118 action failed, 1119 critical failure, 5001 real-time protection disabled, 5007 configuration changed (1120 records deduced threat hashes) | Microsoft Learn, "Troubleshoot Microsoft Defender Antivirus" event reference (fetched 2026-11-28) |
| A2 | Same note summary | Poorly worded | Grouped 4656 and 5157 as "network-share IDs" | Regrouped as object-access, share and filtering IDs, each with its meaning | Same note's own key terms; Microsoft event descriptions |
| A3 | Attack Recognition: PsExec item | Poorly worded | Listed T1569.002 as if it were a lateral-movement technique | T1021.002 carries the lateral movement; T1569.002 is filed under Execution | MITRE ATT&CK technique pages (from knowledge, not fetched) |
| A4 | MC: "A single SHA-256 hash ... what type of indicator?" (Practice Exam item) | **Ambiguous** | The option "Computed pattern" was defensible, because the Lockheed Martin model classes hashes as computed indicators | Distractor replaced with "Operational trend"; explanation cites the atomic vs behavioral framing | Chapple, CySA+ Study Guide CS0-004, IoC section ("Atomic indicators ... file hashes") |
| A5 | Supplemental MC: Microsoft directory history | **Incorrect** and Out of scope | "Windows NT 3.0, released in 1990" | Reworded: Windows NT domains, first shipped in NT 3.1 (1993). Explanation added; progress kept through `oid`. | General knowledge; no NT 3.0 release exists |

## 2. Manual review sample

The sample is 60 items from the 2,111-item CySA+ multiple-choice bank. It was drawn with a seeded, stratified random selection: proportional by revision set and domain, with at least 2 items per stratum. That gives 35 core items (scenario rewrites and new exam items) and 25 supplemental items.

| Classification | Count | Notes |
|---|---|---|
| Correct | 46 | 32 core, 14 supplemental |
| Poorly worded | 2 | Core items. Easy distractors or pure recall. Kept, since they are low-stakes. |
| Ambiguous | 1 | A4, fixed |
| Outdated | 0 | Item 30 uses OWASP Top 10 2021 naming, noted |
| Incorrect | 1 | A5, fixed. Supplemental. |
| Out of scope | 1 | Supplemental (Snort internals) |
| Advanced-only | 9 | All supplemental, from vendor-course depth (AD internals, ETW, Zeek detail) |

**Reading the sample.**
- In the core pool, which is what fixed exams and Fresh runs draw from, 32 of 35 items were correct as written. The one ambiguous item has been fixed.
- Supplemental items are already kept out of the core pools by default. 10 of the 25 are beyond CS0-004 depth. They stay available as optional depth practice, and they stay labelled supplemental.
- With 60 items, this is a spot check, not a certification of the whole bank. If 46 of 60 correct is taken at face value, a 90% Wilson interval for the share of items that are fully correct is roughly 67–84%. Most non-correct items are scope labels, not errors.

<details><summary>Full sample (60 items)</summary>

| # | Bank index | Pool | Domain | Obj | Question (first 70 chars) | Classification | Note |
|---|---|---|---|---|---|---|---|
| 1 | 2034 | core | ir_mgmt | 3.3 | An analyst is unsure whether an alert is a true incident. Which TWO st… | Correct |  |
| 2 | 1955 | core | ir_mgmt | 3.1 | A SOC can block only one Kill Chain stage reliably this quarter. Defen… | Correct |  |
| 3 | 2029 | core | ir_mgmt | 3.3 | RCA shows the attacker used an old VPN account belonging to a former e… | Correct |  |
| 4 | 2079 | core | reporting | 4.2 | Which metric counts how many alerts the SOC received in a period? | Poorly worded | Pure definition recall with an obvious answer; acceptable as a warm-up item, weak as exam practice. |
| 5 | 2046 | core | reporting | 4.1 | An unsupported Windows Server 2008 system runs a critical app. Which i… | Correct |  |
| 6 | 1712 | core | secops | 1.1 | During a cloud review, an analyst sees that a Kubernetes cluster's API… | Correct |  |
| 7 | 1793 | core | secops | 1.4 | A single SHA-256 hash of a malware file is what type of indicator? | Ambiguous | "Computed pattern" was defensible because the Lockheed Martin model classes hashes as computed indicators. Distractor replaced; source cited. Fixed. |
| 8 | 1795 | core | secops | 1.4 | During design, a team asks, 'Could someone deny they approved this tra… | Correct |  |
| 9 | 1799 | core | secops | 1.4 | An ISAC report says a ransomware affiliate uses Cobalt Strike beacons … | Correct |  |
| 10 | 1898 | core | vulnmgmt | 2.3 | Configuration management tools reapply hardened settings to servers ev… | Correct |  |
| 11 | 1919 | core | vulnmgmt | 2.3 | True negatives are rarely reported, but why do they matter in vulnerab… | Correct |  |
| 12 | 1904 | core | vulnmgmt | 2.3 | Which internal factor MOST justifies fixing a medium finding before a … | Correct |  |
| 13 | 1248 | core | ir_mgmt | 3.2 | A responder wants to search every endpoint quickly for a file hash fro… | Correct |  |
| 14 | 1260 | core | ir_mgmt | 3.3 | The SOC writes step-by-step procedures for handling phishing, ransomwa… | Correct |  |
| 15 | 1669 | core | ir_mgmt | 3.2 | An analyst must determine whether malware on a host is part of a targe… | Correct |  |
| 16 | 1273 | core | ir_mgmt | 3.2 | Which action would MOST likely harm the admissibility of digital evide… | Correct |  |
| 17 | 1317 | core | ir_mgmt | 3.2 | An organization needs incident responders available 24/7 but has no ni… | Correct |  |
| 18 | 1200 | core | reporting | 4.1 | Security wants developers to fix flaws found by static code analysis. … | Correct |  |
| 19 | 1094 | core | reporting | 4.1 | A zero-day affecting the company's VPN appliance is published on a Fri… | Correct |  |
| 20 | 1104 | core | reporting | 4.1 | A vulnerability report is going to both the help desk and the board. W… | Correct |  |
| 21 | 1126 | core | reporting | 4.2 | EDR automatically cleans a low-severity malware detection on one works… | Correct |  |
| 22 | 226 | core | secops | 1.1 | A domain controller has the Print Spooler service running, although it… | Correct |  |
| 23 | 1482 | core | secops | 1.2 | After an unknown account named support2 was created on a web applicati… | Correct |  |
| 24 | 1565 | core | secops | 1.4 | An inexperienced attacker runs a point-and-click tool from the interne… | Poorly worded | Distractors are easy to eliminate; low discrimination. |
| 25 | 625 | core | secops | 1.2 | Sysmon event 10 shows an unfamiliar process opening a handle to lsass.… | Correct |  |
| 26 | 190 | core | secops | 1.4 | A hunt team plants a decoy service account that no one should use. The… | Correct |  |
| 27 | 555 | core | secops | 1.4 | A new SOC hire spends the shift reviewing incoming alerts, closing fal… | Correct |  |
| 28 | 267 | core | secops | 1.3 | An analyst needs to examine a suspicious HTTPS session in a packet cap… | Correct |  |
| 29 | 41 | core | secops | 1.1 | A company issues phones to field staff and needs to enforce OS version… | Correct |  |
| 30 | 1392 | core | vulnmgmt | 2.4 | A software composition analysis tool finds a bundled library with a kn… | Correct | Uses the OWASP Top 10 2021 category name. Later OWASP editions rename and merge categories, so the wording may date. |
| 31 | 1369 | core | vulnmgmt | 2.2 | Before assigning remediation for a high-severity scanner finding, whic… | Correct |  |
| 32 | 1417 | core | vulnmgmt | 2.1 | Containers are rebuilt from images several times a day. Where should v… | Correct |  |
| 33 | 1441 | core | vulnmgmt | 2.1 | A new critical CVE affects a specific version of a web server. Which s… | Correct |  |
| 34 | 386 | core | vulnmgmt | 2.4 | A $3,000 laptop has an exposure factor of 90% for theft, and the compa… | Correct |  |
| 35 | 301 | core | vulnmgmt | 2.2 | An Nmap scan of a Linux web server returns: 22/tcp open ssh, 80/tcp op… | Correct |  |
| 36 | 432 | supplemental | ir_mgmt |  | Why should an incident response policy be written to be relatively "ti… | Correct |  |
| 37 | 491 | supplemental | ir_mgmt |  | What risk remains even when a compromised system is placed in network … | Correct |  |
| 38 | 544 | supplemental | reporting |  | Why is alert volume considered a weak standalone metric for incident r… | Correct |  |
| 39 | 522 | supplemental | reporting |  | Why is relying solely on a Top 10 risk list not recommended as a compl… | Correct |  |
| 40 | 963 | supplemental | secops |  | What is a Distinguished Name (DN) in Active Directory? | Advanced-only | Active Directory DN syntax is background knowledge from a vendor course, not a named CS0-004 bullet. |
| 41 | 722 | supplemental | secops |  | What two actions can help prevent ICMP tunneling from succeeding in an… | Correct |  |
| 42 | 249 | supplemental | secops |  | With full control (e.g., GenericAll) over another user object, what ar… | Advanced-only | AD ACL abuse (GenericAll) is deeper than the CS0-004 objectives. |
| 43 | 629 | supplemental | secops |  | In ETW's publish-subscribe model, what role do Providers play? | Advanced-only | ETW internals are deeper than the CS0-004 objectives. |
| 44 | 818 | supplemental | secops |  | What is FLOSS, and what specific problem does it solve that the plain … | Correct |  |
| 45 | 1076 | supplemental | secops |  | Why does OWASP maintain a separate API Security Top 10 rather than rel… | Correct |  |
| 46 | 684 | supplemental | secops |  | Which two technologies are recommended as the strongest mitigations ag… | Correct |  |
| 47 | 258 | supplemental | secops |  | What is a "Golden Certificate," and what does obtaining one require co… | Advanced-only | AD CS attack detail is deeper than the CS0-004 objectives. |
| 48 | 231 | supplemental | secops |  | What does setting the RegisterSpoolerRemoteRpcEndPoint registry key to… | Advanced-only | Registry-level Print Spooler hardening is deeper than the CS0-004 objectives. |
| 49 | 754 | supplemental | secops |  | How does DNS tunneling via TXT records mechanically resemble ICMP tunn… | Correct |  |
| 50 | 129 | supplemental | secops |  | Which three Zeek logs together reveal a PsExec-based attack, and what … | Advanced-only | Zeek per-log PsExec detail is deeper than the CS0-004 objectives. |
| 51 | 111 | supplemental | secops |  | What is the difference between Snort's perf_monitor module and its pro… | Out of scope | Snort module internals are not a CS0-004 objective. |
| 52 | 928 | supplemental | secops |  | What was Microsoft's first attempt at directory services, released in … | Incorrect | Said Windows NT 3.0 shipped in 1990; the first NT release was NT 3.1 (1993). Rewritten with an explanation; also out of scope. |
| 53 | 792 | supplemental | secops |  | In the ReadProcessMemory call flow example, what happens after kernel3… | Advanced-only | Windows API call flow is malware-analysis depth. |
| 54 | 225 | supplemental | secops |  | What is the "Transited Services" attribute in a Windows logon event, a… | Advanced-only | Logon-event field detail is deeper than the CS0-004 objectives. |
| 55 | 1025 | supplemental | secops |  | Where are Domain Cached Credentials stored, and how many are retained … | Advanced-only | Domain cached credentials storage is deeper than the CS0-004 objectives. |
| 56 | 724 | supplemental | secops |  | What is the purpose of directory fuzzing from an attacker's perspectiv… | Correct |  |
| 57 | 621 | supplemental | secops |  | Sysmon Event ID 10 corresponds to which type of event, and what is its… | Correct |  |
| 58 | 766 | supplemental | secops |  | Which of the following is NOT listed as a legitimate common use case f… | Correct |  |
| 59 | 359 | supplemental | vulnmgmt |  | What makes remote code execution (RCE) vulnerabilities especially dang… | Correct |  |
| 60 | 412 | supplemental | vulnmgmt |  | How does mutation testing differ from fault injection? | Correct |  |

</details>

## 3. Not yet covered
- Tool facts (Nmap flags, Wireshark filters, SPL and KQL syntax) were checked only where they appear in the sampled items. The Commands & Queries data needs its own pass.
- Security+, Network+ and A+ banks were not part of this audit.
- Explanations were not systematically given source references. References were added only where an item was nuanced or corrected (A1, A4, A5).
