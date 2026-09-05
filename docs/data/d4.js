(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 31,
    centralQuestion: "Once the notebook produces a model, who owns its validation, release, monitoring, and retirement?",
    objective: "Design an end-to-end ML lifecycle with explicit artifacts, owners, gates, feedback, monitoring, retraining, and retirement; distinguish experimentation from controlled production state.",
    sections: [
      {
        id: "lifecycle",
        title: "The lifecycle is a governed feedback system",
        body: [
          "Experimentation tests hypotheses about data, features, algorithms, and objectives. Training fits parameters; validation selects a candidate under a production-aligned design; registration records an immutable model version and lineage. Deployment makes a specific release available to traffic. Monitoring observes system, data, model, and business behavior. Retraining creates a new candidate—it does not silently modify the one already serving.",
          "Each transition needs entry criteria, outputs, and ownership. A training run can succeed computationally while failing model validation. A registered candidate can be valid yet unapproved for a high-risk use. A deployed model can be healthy at the process level while harming the business because thresholds, workflow, or user behavior changed.",
          "Retirement is part of the lifecycle. Remove traffic, revoke access, archive required artifacts and evidence, update downstream references, and define retention. Keeping every old endpoint ‘just in case’ expands attack and support surfaces."
        ],
        diagram: diagram("cycle", "Controlled ML lifecycle", ["Experiment + train", "Validate + register", "Approve + deploy", "Monitor", "Retrain or retire"], [[0,1],[1,2],[2,3],[3,4],[4,0]], "Feedback creates a new version through the gates; production artifacts do not mutate in place."),
        check: { question: "Why should retraining create a new candidate rather than overwrite production?", answer: "The new data and parameters need independent validation, approval, comparison, and a rollback reference to the previous release." }
      },
      {
        id: "artifacts-owners",
        title: "Every stage emits evidence another stage consumes",
        body: [
          "A run emits parameters, metrics, logs, model files, feature/preprocessing artifacts, environment details, and data references. Validation emits a report by metric, slice, calibration, safety, and resource profile. Registration binds this evidence to a version. Deployment emits a release manifest mapping model, code, image, configuration, and traffic policy. Monitoring emits time series, traces, incidents, and labeled performance when outcomes mature.",
          "Ownership follows the evidence. Data owners define contracts and correct source defects. Model owners define intended use and quality gates. Platform owners keep serving and telemetry reliable. Business owners accept decision thresholds and risk. Incident commanders coordinate failures; no role can outsource its responsibility to ‘the AI.’",
          "A handoff is not a file upload. It includes runbook, SLOs, dashboards, alert routes, retraining policy, rollback procedure, dependencies, known limitations, and accountable on-call ownership."
        ],
        table: table("Lifecycle gate evidence", ["Transition", "Minimum evidence", "Stop condition"], [
          ["Experiment → candidate", "Reproducible run + production-aligned validation", "Leakage or unresolved data quality"],
          ["Candidate → registered", "Artifact, signature/schema, lineage, evaluation", "Missing immutable references"],
          ["Registered → release", "Approval, security, load, rollback plan", "Critical gate failure"],
          ["Release → full traffic", "Progressive metrics and business guardrails", "SLO/error/quality regression"],
          ["Production → retraining", "Trigger evidence and fresh validation", "Unmatured labels or unknown root cause"]
        ]),
        failure: "Treating registry entry as approval collapses technical storage and governance. Registration should make a candidate identifiable; an explicit policy or reviewer grants promotion.",
        check: { question: "What does a release manifest add beyond a model version?", answer: "It records the complete behavior stack—code/image, preprocessing, model, configuration, prompt/index if relevant, and traffic policy actually deployed." }
      },
      {
        id: "feedback",
        title: "Monitoring closes the loop only when labels and actions are trustworthy",
        body: [
          "Production feedback may arrive late and selectively. Fraud labels mature after investigations; clinicians review high-risk cases more often; recommendation clicks reflect what was shown. Monitoring raw accuracy on observed outcomes can therefore be biased by the model’s own decisions. Record exposure, intervention, label maturity, and policy version.",
          "Retraining triggers can be scheduled, drift-based, performance-based, or event-based. A trigger starts a controlled pipeline; it should not guarantee promotion. Diagnose data defects before learning them. Validate the candidate against the incumbent and run rollback-ready deployment.",
          "Lifecycle maturity means failures are recoverable and evidence is traceable. Automation should remove repetitive steps while leaving high-impact decisions explicit."
        ],
        code: code("python", "release = {\n    \"code_commit\": CODE_COMMIT,\n    \"image_digest\": IMAGE_DIGEST,\n    \"data_snapshot\": DATA_SNAPSHOT,\n    \"model_version\": MODEL_VERSION,\n    \"feature_contract\": \"risk-features/4\",\n    \"policy_version\": \"review-threshold/7\",\n    \"approved_by\": approval_record.id,\n    \"rollback_to\": CURRENT_PRODUCTION_VERSION\n}\nassert validation_report.passes_all_gates(release)\ndeployer.canary(release, traffic_percent=5)", [
          "Every mutable component is resolved to an immutable identity.",
          "Approval is referenced as evidence rather than implied by code success.",
          "Rollback target exists before traffic moves.",
          "The first release step limits exposure."
        ], "It prevents a model-only version from hiding code/config changes and prevents an unapproved candidate from moving directly to full traffic."),
        check: { question: "Why can observed production labels be selection-biased?", answer: "The model or workflow may determine which cases receive investigation or exposure, so outcomes are observed disproportionately for certain predictions." }
      }
    ],
    glossary: [
      ["ML lifecycle", "Controlled path from experimentation through retirement and feedback."],
      ["Experimentation", "Hypothesis-driven comparison of data, model, and configuration choices."],
      ["Registration", "Creation of an identifiable immutable model version with metadata."],
      ["Deployment", "Making a release available to a target environment or traffic."],
      ["Monitoring", "Ongoing observation of system, data, model, and business behavior."],
      ["Retraining", "Fitting a new candidate from new or revised evidence."],
      ["Release manifest", "Mapping of all immutable components and policies in a deployment."],
      ["Gate", "Pass/fail criterion controlling a lifecycle transition."],
      ["Label maturity", "Point when an outcome can be considered fully observed."],
      ["Retirement", "Controlled removal and archival of a model or service version."]
    ],
    exercise: {
      duration: 35,
      title: "Create a lifecycle control sheet for a fraud model",
      brief: "A notebook model is ready for production, fraud labels mature after 60 days, and the review threshold changes monthly.",
      parts: [
        "List artifacts and evidence emitted at experiment, validation, registration, release, and monitoring stages.",
        "Assign data, model, platform, business, approval, and incident owners.",
        "Define promotion and rollback gates plus a 5% canary.",
        "Design retraining triggers that account for delayed and selectively observed labels."
      ],
      solution: "Bind run, data snapshot, features, environment, model, validation slices, calibration, and resource tests into registration. The release manifest adds code/image and threshold policy. Data owners handle contracts; model owners quality; platform owners SLOs; business/risk owners threshold and impact. Canary gates cover p95 latency, errors, alert volume, score distribution, and matured proxy/early signals. Retraining triggers create a candidate; promotion waits for 60-day labels or validated leading indicators and corrects for which cases were investigated."
    },
    sources: { core: ["mlflowTracking","mlflowRegistry"], deep: ["azureWellArchitectedAI","otel"] },
    quiz: [
      { concept:"Lifecycle", prompt:"A scheduled job retrains and overwrites the production model file every Sunday. What is the central control failure?", answer:1, options:[
        ["Sunday is never a valid training day.","The day is irrelevant."],
        ["Training bypasses versioned validation, approval, deployment, and rollback.","Correct."],
        ["The file should be larger.","Size does not create governance."],
        ["Monitoring should be disabled during retraining.","Monitoring remains essential."]
      ]},
      { concept:"Registration", prompt:"What should registering a model establish?", answer:2, options:[
        ["That it is automatically safe for every use.","Intended-use approval is separate."],
        ["That it is already serving all traffic.","Registration precedes deployment."],
        ["A named immutable version with artifacts, lineage, and metadata.","Correct."],
        ["That its test set may be reused for tuning.","That contaminates evidence."]
      ]},
      { concept:"Release manifest", prompt:"Two releases use the same model but different thresholds. Are they behaviorally the same?", answer:0, options:[
        ["No; policy version changes decisions and must be part of the release identity.","Correct."],
        ["Yes, only weights matter.","Decision behavior includes policy."],
        ["Yes, if container names match.","Names can hide config differences."],
        ["No, because thresholds retrain weights.","They change decisions without retraining."]
      ]},
      { concept:"Gate", prompt:"A candidate improves average AUC but violates a critical subgroup recall floor. What should the lifecycle gate do?", answer:3, options:[
        ["Average the subgroup away.","That hides the failure."],
        ["Register it as production automatically.","Registration is not promotion."],
        ["Raise traffic to gather more harm evidence.","Critical gates should limit exposure."],
        ["Block promotion until the regression is resolved or explicitly governed.","Correct."],
      ]},
      { concept:"Feedback bias", prompt:"Only alerted fraud cases are investigated. Can observed precision and recall be estimated naively?", answer:1, options:[
        ["Yes, every negative is known.","Non-alerted fraud outcomes may remain unseen."],
        ["No; label observation depends on the model’s decision.","Correct. Use exploration, delayed sources, or correction methods."],
        ["Yes, if training accuracy is high.","Training fit does not remove selection."],
        ["No, because precision never uses labels.","Precision requires outcomes."]
      ]},
      { concept:"Retraining", prompt:"A drift alert fires because an upstream unit changed from SAR to halalas. Should the model retrain immediately?", answer:0, options:[
        ["No; repair the contract/data defect before a new model learns it.","Correct."],
        ["Yes; retraining makes units equivalent automatically.","It may learn a corrupted scale."],
        ["Yes; overwrite production to reduce alert volume.","That bypasses diagnosis and gates."],
        ["No; drift can never justify retraining.","Valid real drift can trigger candidate training."]
      ]},
      { concept:"Retirement", prompt:"Why remove unused legacy endpoints instead of leaving them indefinitely?", answer:2, options:[
        ["Old models consume no support or security surface.","They do."],
        ["Retirement deletes required audit records.","Required evidence should be archived."],
        ["Dormant routes expand attack, dependency, and ownership obligations.","Correct."],
        ["Every old model is automatically inaccurate.","Accuracy varies; lifecycle control is the point."]
      ]}
    ]
  });

  register({
    id: 32,
    centralQuestion: "A metric improved six weeks ago. Can you reconstruct the exact data, parameters, code, and artifact that produced it?",
    objective: "Design experiment tracking around runs, parameters, metrics, artifacts, metadata, parent/child relationships, tags, reproducibility, and comparison discipline.",
    sections: [
      {
        id: "run",
        title: "A run is an immutable account of one attempted computation",
        body: [
          "An experiment groups runs that answer a related question. A run captures one execution: parameters and configuration supplied before or during training; metrics observed over steps and at completion; artifacts such as models, plots, schemas, and reports; metadata such as start time, code commit, environment, owner, and status. The run should remain immutable enough to audit—correct a bad run by creating another, not editing history.",
          "Parameters are inputs to behavior: learning rate, feature version, split seed, model family, prompt template. Metrics are measured outputs: loss over steps, validation PR-AUC, latency, calibration, slice recall. Artifacts are files or structured outputs too rich for scalar fields. Tags classify intent, risk, dataset, or review status but should not replace immutable lineage.",
          "A failed run is valuable evidence if failure reason and partial state are recorded. Deleting failures creates survivorship bias and makes unstable pipelines appear reliable."
        ],
        table: table("Tracking object semantics", ["Object", "Examples", "Mutation policy", "Question answered"], [
          ["Experiment", "churn-feature-v4", "Stable grouping", "What hypothesis family?"],
          ["Run", "one seed/config execution", "Immutable record", "What happened once?"],
          ["Parameter", "depth=8, data=v12", "Record input", "What was chosen?"],
          ["Metric", "val_ap=0.43 at step 900", "Append with step/time", "What was observed?"],
          ["Artifact", "model, ROC plot, schema", "Content-addressed/versioned", "What was produced?"],
          ["Tag", "team=risk, purpose=shadow", "Controlled metadata", "How is it classified?"]
        ]),
        check: { question: "Why should failed training runs remain discoverable?", answer: "They reveal pipeline reliability, bad parameter regions, resource limits, and repeated failure patterns; deleting them biases the experiment record." }
      },
      {
        id: "comparability",
        title: "Comparable runs differ in controlled ways",
        body: [
          "A leaderboard is credible only when runs use the same evaluation set, metric definition, label maturity, and preprocessing boundary. If one candidate uses a random split and another a temporal holdout, sorting by score is meaningless. Track dataset/split identity and metric implementation alongside the value.",
          "Parent–child runs organize searches: a parent represents the tuning job, children individual trials, and optionally seed repetitions under one configuration. Log training curves with step and timestamp; a final metric alone hides divergence, early stopping, and compute budget.",
          "Run names are for humans; IDs are for references. Avoid encoding all metadata in a string. Tags should support searches such as ‘all D4 candidates trained on snapshot 2026-09 with security suite passed.’"
        ],
        example: "Run A reports F1 0.86 at a threshold optimized on its test set. Run B reports 0.82 at a validation-selected threshold on a locked future test. A naïve leaderboard promotes A; a tracked evaluation protocol reveals that B has credible evidence and A is contaminated.",
        failure: "Logging only the best hyperparameters after a search loses the trial distribution and selection pressure. Retain child runs and the selection rule so apparent gains can be assessed against search breadth.",
        check: { question: "Why is metric definition part of lineage?", answer: "Two fields named `accuracy` can use different label filters, averaging, thresholds, or maturity windows; the number alone is not comparable." }
      },
      {
        id: "reproduce",
        title: "Tracking enables reconstruction; it does not guarantee it",
        body: [
          "A tracker can record a mutable table name yet still fail to reproduce data. Store immutable data version or query plus snapshot time, checksums, feature code commit, environment lock, random seeds, and external model version. Capture hardware and deterministic settings when numeric equivalence matters.",
          "Artifact storage needs access control, retention, integrity, and separation of sensitive content. Never log secrets as parameters. Dataset samples, prompts, or misclassified examples may contain personal data; store redacted references or access-controlled artifacts according to policy.",
          "A reproduction test reruns a selected candidate from its record and compares metrics and fixture predictions within tolerance. Treat large divergence as a release blocker and small nondeterminism as documented variance."
        ],
        code: code("python", "with tracker.start_run(run_name=\"temporal-holdout-v4\") as run:\n    tracker.log_params({\n        \"data_snapshot\": data.digest,\n        \"split_manifest\": split.digest,\n        \"code_commit\": git_commit,\n        \"seed\": seed,\n        \"model_family\": \"gradient_boosting\"\n    })\n    tracker.log_metric(\"validation_average_precision\", ap, step=fit_steps)\n    tracker.log_metric(\"p95_inference_ms\", p95_ms)\n    tracker.log_artifact(\"reports/slice_metrics.json\")\n    tracker.set_tags({\"purpose\": \"candidate\", \"label_maturity\": \"60d\"})", [
          "Data and split are content identities, not mutable filenames.",
          "Metric step preserves training-budget context.",
          "System and slice evidence accompany predictive quality.",
          "Label maturity is explicit metadata."
        ], "It prevents score comparison across unknown data/splits and avoids a model-only artifact with no operational evidence."),
        check: { question: "Why should secrets never be tracked as run parameters?", answer: "Tracking systems replicate and display metadata broadly; a parameter becomes durable credential exposure rather than controlled secret use." }
      }
    ],
    glossary: [
      ["Experiment", "Logical collection of runs addressing a shared objective."],
      ["Run", "Recorded execution of one configuration or task."],
      ["Parameter", "Input configuration value recorded for a run."],
      ["Metric", "Measured scalar, often associated with step and time."],
      ["Artifact", "File or structured output produced or used by a run."],
      ["Metadata", "Context describing ownership, time, code, environment, and status."],
      ["Tag", "Searchable classification attached to a run or model."],
      ["Parent run", "Run grouping related child trials."],
      ["Split manifest", "Immutable record of examples/groups assigned to partitions."],
      ["Reproduction test", "Replay of a tracked run to verify reconstructable behavior."]
    ],
    exercise: {
      duration: 35,
      title: "Repair an unusable experiment leaderboard",
      brief: "A spreadsheet lists run name, final accuracy, and owner; candidates used different splits, seeds, datasets, and thresholds.",
      parts: [
        "Define the experiment, run, parameter, metric, artifact, and tag schema.",
        "Create comparability gates before sorting runs.",
        "Design parent/child tracking for 30 configurations × 3 seeds.",
        "Specify a reproduction test and sensitive-artifact policy."
      ],
      solution: "Require immutable data/split, metric definition, threshold-selection protocol, code/environment, and label maturity before comparison. Parent runs represent the search; child runs represent configurations and seed repetitions. Rank only comparable future-holdout results and include variance, slice metrics, latency, and cost. Replay the selected run in the locked environment and compare fixture predictions/metrics within tolerance. Keep secrets out; store sensitive error examples in access-controlled locations with redacted references."
    },
    sources: { core: ["mlflowTracking"], deep: ["mlflowRegistry","otel"] },
    quiz: [
      { concept:"Runs", prompt:"A training attempt fails from GPU OOM. Should its run be deleted?", answer:2, options:[
        ["Yes, failed runs have no information.","They reveal resource and pipeline reliability."],
        ["Yes, to improve success rate reporting.","That creates survivorship bias."],
        ["No; retain failure status, parameters, and diagnostics.","Correct."],
        ["No; promote its partial model automatically.","Retention is not promotion."]
      ]},
      { concept:"Parameters vs metrics", prompt:"Which pair is classified correctly?", answer:0, options:[
        ["learning_rate = parameter; validation_AP = metric","Correct."],
        ["validation_AP = parameter; seed = metric","Their roles are reversed."],
        ["model file = scalar metric; owner = artifact","A model is artifact and owner metadata."],
        ["data snapshot = output label only; loss = secret","Neither classification is correct."]
      ]},
      { concept:"Comparability", prompt:"Two runs use different test periods but share the metric name `F1`. Can their values be ranked directly?", answer:1, options:[
        ["Yes, identical names prove identical evidence.","Population and protocol differ."],
        ["No; first align split, label, threshold, and metric definitions.","Correct."],
        ["Yes, if the larger number has more decimals.","Precision does not create comparability."],
        ["No, because F1 can never compare models.","It can under consistent evidence and purpose."]
      ]},
      { concept:"Search tracking", prompt:"Why store all hyperparameter trials instead of only the winner?", answer:3, options:[
        ["To make artifacts larger.","Storage is not the goal."],
        ["To expose secrets.","Secrets must not be logged."],
        ["To guarantee the winner generalizes.","Tracking cannot guarantee that."],
        ["To understand selection breadth, stability, failures, and whether the gain is exceptional.","Correct."],
      ]},
      { concept:"Data lineage", prompt:"A run records `table=customers_latest`. Why is reproduction weak?", answer:2, options:[
        ["Table names cannot contain letters.","They can."],
        ["The model should not use customers.","Use-case validity is not the issue."],
        ["The table is mutable; record a snapshot/version or reproducible query and cutoff.","Correct."],
        ["Latest is always an immutable digest.","It is typically a moving reference."]
      ]},
      { concept:"Metric history", prompt:"What does logging loss with step add over one final loss?", answer:0, options:[
        ["It reveals convergence, divergence, and early-stopping behavior over budget.","Correct."],
        ["It removes the need for validation.","Training curves do not replace held-out evidence."],
        ["It hides runtime failures.","It helps expose them."],
        ["It encrypts labels.","Tracking is not encryption."]
      ]},
      { concept:"Sensitive tracking", prompt:"A run parameter contains an external API key. What is the right response?", answer:1, options:[
        ["Keep it because parameters are private by definition.","Tracking stores often have broad durable access."],
        ["Revoke/rotate it, remove exposure where possible, and use a secret store reference.","Correct."],
        ["Copy it into every artifact for reproducibility.","That multiplies compromise."],
        ["Hash it and use the hash as the credential.","The credential must still be supplied securely; a hash may itself be sensitive."]
      ]}
    ]
  });

  register({
    id: 33,
    centralQuestion: "What should MLflow record so another engineer can compare, reproduce, and promote the run without treating the tracker as a dumping ground?",
    objective: "Use MLflow experiments, runs, parameters, metrics, artifacts, autologging, tracking stores, and model logging; design team-safe tracking with reproducible references and sensitive-data controls.",
    sections: [
      {
        id: "architecture",
        title: "MLflow separates metadata from artifact bytes",
        body: [
          "MLflow Tracking organizes experiments and runs. A backend store retains run metadata, parameters, metrics, and tags; an artifact store retains larger files such as models, plots, and reports. A tracking server can mediate access to both. Team deployments need authentication, authorization, network controls, backup, and retention around these stores.",
          "The tracking URI tells clients where to record. An experiment name groups work; `start_run` creates lifecycle scope. Autologging captures common parameters, metrics, and models from supported libraries, reducing omission. It should be audited: automatic capture may log sensitive samples, large artifacts, or misleading default metrics, and it never knows the business context you failed to provide.",
          "Use tags for purpose and governance; use immutable values for lineage. A run ID references an execution. An artifact URI points to run outputs. Model logging packages a model in an MLflow-compatible format/flavor with environment information, but feature semantics and evaluation evidence still need explicit artifacts."
        ],
        table: table("MLflow component", ["Component", "Stores/does", "Engineering control"], [
          ["Tracking client", "Logs run data", "Pinned client; safe defaults"],
          ["Tracking server", "API and optional artifact proxy", "Auth, TLS, quotas"],
          ["Backend store", "Run metadata/metrics", "Database reliability and backup"],
          ["Artifact store", "Models/reports/files", "Integrity, ACLs, retention"],
          ["Autologging", "Framework-specific automatic capture", "Review content and naming"],
          ["Model flavor", "Portable load/serve conventions", "Runtime/schema compatibility"]
        ]),
        check: { question: "Why is the tracking backend not the same as the artifact store?", answer: "Metadata and scalar histories have different access and storage needs from large model/report bytes; MLflow addresses them separately." }
      },
      {
        id: "implementation",
        title: "Track the causal inputs, not every local variable",
        body: [
          "Log hyperparameters and all settings that can change results: data/split digest, feature contract, seed, algorithm, class weights, calibration method, threshold-selection rule, and code reference. Log training and validation metrics with steps, plus test metrics only after decisions are frozen. Log slice tables, curves, schema signatures, environment locks, and evaluation reports as artifacts.",
          "Use `log_model` to package the fitted pipeline, not only the final estimator. Provide an input example and signature so serving can validate shape and types. Avoid putting personal records into the example; use synthetic representative values. Treat a logged model as a run artifact until it is deliberately registered.",
          "Nested runs can represent tuning trials, folds, or seed repetitions, but uncontrolled nesting becomes hard to interpret. Establish naming and parent semantics before parallel experiments."
        ],
        code: code("python", "import mlflow\nfrom mlflow.models import infer_signature\n\nmlflow.set_experiment(\"fraud-temporal-validation\")\nwith mlflow.start_run(tags={\"purpose\": \"candidate\", \"risk_tier\": \"high\"}) as run:\n    mlflow.log_params({\n        \"data_digest\": data_digest, \"split_digest\": split_digest,\n        \"code_commit\": code_commit, \"seed\": 42, \"threshold_rule\": \"capacity-1000\"\n    })\n    pipeline.fit(X_train, y_train)\n    p_valid = pipeline.predict_proba(X_valid)[:, 1]\n    mlflow.log_metric(\"valid_average_precision\", average_precision_score(y_valid, p_valid))\n    signature = infer_signature(X_example, pipeline.predict_proba(X_example))\n    mlflow.sklearn.log_model(pipeline, name=\"model\", signature=signature,\n                              input_example=X_example)\n    mlflow.log_artifact(\"reports/slices.json\", artifact_path=\"evaluation\")", [
          "Experiment and purpose tags provide searchable context.",
          "Data and split digests make the result population identifiable.",
          "The whole preprocessing pipeline is logged as the model artifact.",
          "Signature/example make expected I/O inspectable without using real personal data."
        ], "It prevents an orphan estimator, ambiguous evaluation population, and a production loader that reconstructs preprocessing differently."),
        check: { question: "Why should the capacity-based threshold rule be logged even if the model artifact outputs probabilities?", answer: "It influenced validation and the downstream release decision; another engineer needs it to recreate operational metrics." }
      },
      {
        id: "operations",
        title: "A tracking system needs its own reliability and governance",
        body: [
          "Concurrent teams can create inconsistent names, overwrite artifact paths, or flood the store. Adopt experiment ownership, tag dictionaries, retention, size limits, and least-privilege access. The tracking service should not become a route to download sensitive training samples or executable artifacts from untrusted teams.",
          "Artifact integrity and provenance matter because model formats may execute code. Promotion pipelines should resolve run/model URIs to immutable versions, verify digests, and load only trusted artifacts. Back up metadata and artifact references together so a restored run does not point to missing files.",
          "Autologging and UI comparison accelerate work, but review the actual metric protocol. MLflow can faithfully record a leaked experiment. Tooling improves traceability; engineering judgment establishes validity."
        ],
        example: "Two teams log `accuracy` but one excludes uncertain labels. The UI ranks them together. A metric catalog and validation-report artifact reveal different denominators. The correction is not a prettier chart; it is a controlled metric definition and comparable experiment boundary.",
        failure: "Putting an approval decision only in a mutable run tag lets anyone with edit access appear to promote a model. Use a controlled registry alias/change workflow or external approval record with audit permissions.",
        check: { question: "Can MLflow prevent temporal leakage automatically?", answer: "No. It can record the split and artifacts, but the engineer must design and validate point-in-time data and evaluation." }
      }
    ],
    glossary: [
      ["MLflow Tracking", "Experiment/run metadata and artifact logging capability."],
      ["Tracking URI", "Endpoint a client uses for tracking operations."],
      ["Backend store", "Storage for run metadata, parameters, metrics, and tags."],
      ["Artifact store", "Storage for models, plots, reports, and other files."],
      ["Autologging", "Automatic framework-specific capture of run information."],
      ["Model flavor", "MLflow convention for loading/serving a framework model."],
      ["Model signature", "Declared input/output schema for a logged model."],
      ["Input example", "Representative non-sensitive sample documenting expected model input."],
      ["Artifact URI", "Address of an artifact associated with a run."],
      ["Nested run", "Run recorded as a child of another run."]
    ],
    exercise: {
      duration: 35,
      title: "Instrument a leakage-safe MLflow run",
      brief: "Track a scikit-learn pipeline with group CV, calibration, slice evaluation, and a capacity threshold.",
      parts: [
        "Define experiment/tag naming and immutable lineage fields.",
        "Log parent search and child configuration/seed runs.",
        "Log the full pipeline, signature, synthetic input example, curves, and slice report.",
        "Write access, retention, and artifact-trust controls for the tracking service."
      ],
      solution: "Use one experiment for the production-aligned question. Parent run records search space and selection rule; children capture parameters, seeds, fold summaries, failures, and artifacts. Log data/split/code/environment digests, preprocessing and calibrated pipeline, threshold rule, signature, non-sensitive example, and validation slices. Restrict write/read by project, keep secrets and raw personal data out, verify model provenance/digest before loading, and separate recorded candidate tags from controlled registry approval."
    },
    sources: { core: ["mlflowTracking","mlflowRegistry"], deep: ["otel"] },
    quiz: [
      { concept:"MLflow stores", prompt:"Run metrics exist in the database, but model files are missing after restore. What likely was not backed up consistently?", answer:2, options:[
        ["Only the browser cache.","MLflow state is server-side."],
        ["The training labels inside every metric row.","Labels are not normally stored there."],
        ["The artifact store and its references alongside the backend store.","Correct."],
        ["The CSS theme.","Unrelated to model artifacts."]
      ]},
      { concept:"Autologging", prompt:"What is the safest view of MLflow autologging?", answer:1, options:[
        ["It understands business validity automatically.","It cannot detect leakage or intended use."],
        ["It reduces omissions but captured content and metric meaning still require review.","Correct."],
        ["It must log every raw record.","That can violate privacy and is unnecessary."],
        ["It replaces a model registry.","Tracking and registry roles differ."]
      ]},
      { concept:"Model logging", prompt:"A pipeline includes imputation and scaling. What should `log_model` package?", answer:0, options:[
        ["The fitted end-to-end pipeline whenever the serving contract depends on it.","Correct."],
        ["Only the final coefficient array with undocumented features.","That invites serving skew."],
        ["The final test labels.","They are evaluation data, not serving logic."],
        ["A mutable alias instead of artifacts.","An alias points to versions; it is not model content."]
      ]},
      { concept:"Signatures", prompt:"What does a model signature provide?", answer:3, options:[
        ["Proof of business ROI.","It describes I/O, not value."],
        ["A cryptographic approval by itself.","It is schema metadata, not necessarily a digital signature."],
        ["A complete fairness evaluation.","No metrics are implied."],
        ["Expected input and output schema for loading/serving checks.","Correct."],
      ]},
      { concept:"Input examples", prompt:"What should be used as a model input example for a sensitive medical pipeline?", answer:1, options:[
        ["A real identifiable patient record copied into public tracking.","That creates exposure."],
        ["A synthetic, schema-representative record with no personal data.","Correct."],
        ["The production API key.","Credentials never belong in examples."],
        ["No example or signature under any circumstances.","Safe synthetic examples improve compatibility evidence."]
      ]},
      { concept:"Registration", prompt:"A model is logged under a run. Is it now a governed production model version?", answer:2, options:[
        ["Yes, logging equals deployment.","It remains a run artifact."],
        ["Yes, every artifact is approved.","Approval is separate."],
        ["No; deliberate registry/version and promotion steps are still required.","Correct."],
        ["No, because MLflow cannot store models.","It can log and register models."]
      ]},
      { concept:"Tracking limitations", prompt:"An MLflow run faithfully records a random split that leaks patients across folds. What has tracking achieved?", answer:0, options:[
        ["Traceability of an invalid experiment, not validity itself.","Correct."],
        ["Automatic correction of the split.","MLflow does not infer entity semantics."],
        ["Guaranteed deployment safety.","Gates and engineering review remain."],
        ["Removal of all patient data.","No such claim follows."]
      ]}
    ]
  });

  register({
    id: 34,
    centralQuestion: "The registry says ‘champion.’ Which immutable version, lineage, approval, and deployment actually make that statement true?",
    objective: "Operate a model registry using registered models, versions, aliases, tags, lineage, approval, promotion, and rollback; distinguish registry state from deployed state and CI/CD state.",
    sections: [
      {
        id: "objects",
        title: "A registry names model families and immutable candidate versions",
        body: [
          "A registered model is a named family such as `fraud_risk`. Each model version points to a specific logged artifact and source run. Metadata includes creation time, description, tags, signature, and lineage. Versions should be immutable: a new artifact receives a new version rather than replacing bytes beneath an old identifier.",
          "An alias such as `champion`, `candidate`, or `production-eu` is a mutable pointer to a version. Aliases make consumers stable while controlled workflows move the pointer. Tags describe attributes—data period, validation status, risk class—but are not inherently permissions or immutable approvals.",
          "Older ‘stage’ concepts bundle lifecycle names into registry state. Modern workflows often prefer aliases plus explicit environment/deployment records. Whatever mechanism is used, define who may move it, what evidence is required, and how changes are audited."
        ],
        table: table("Registry object semantics", ["Object", "Mutable?", "Purpose", "Misuse"], [
          ["Registered model", "Name/description controlled", "Model family", "One name per experiment run"],
          ["Model version", "Artifact should be immutable", "Specific candidate", "Overwrite bytes in place"],
          ["Alias", "Yes", "Human-stable pointer", "Treat as historical identity"],
          ["Tag", "Usually yes", "Search/classification", "Treat as signed approval"],
          ["Source run", "Historical", "Training/evaluation lineage", "Omit data/split context"]
        ]),
        check: { question: "Why log both alias and resolved version in a deployment trace?", answer: "The alias explains the selection policy; the immutable version proves which artifact actually served and remains stable after the alias moves." }
      },
      {
        id: "promotion",
        title: "Promotion is an evidence-backed state transition",
        body: [
          "Promotion begins with a candidate whose run and validation report satisfy gates. A reviewer or policy checks intended-use metrics, slices, calibration, security, load, dependencies, and rollback. The pipeline then deploys the immutable version, runs smoke/shadow/canary checks, and only later moves full traffic or the production alias according to atomic ordering.",
          "Avoid a split-brain state where the alias says version 18 while serving replicas still run 17. Deployment systems should report actual loaded versions; readiness should include artifact load and fixture checks. The registry is the desired release reference, not real-time proof of every replica’s state.",
          "Separate environments can use aliases such as `staging`, `champion`, and region-specific pointers. Access controls should prevent training jobs from changing production aliases. Approval records should include actor, time, evidence digest, decision, and expiry/conditions."
        ],
        example: "A pipeline moves `champion` to v12 before the canary loads. Autoscaled replicas resolve the alias at different times; some serve v11 and others v12. Pin the release manifest to v12, deploy and verify it, then move any descriptive alias through a controlled atomic workflow. Never let each replica independently resolve a moving pointer.",
        failure: "A registry alias is not a load balancer. Moving it does not guarantee traffic routing, replica rollout, cache invalidation, or health; CD must reconcile actual deployment state.",
        check: { question: "Who should be prevented from moving a production alias directly?", answer: "Ordinary training/experiment identities; only controlled promotion roles or pipelines with required approval evidence should have that permission." }
      },
      {
        id: "rollback",
        title: "Rollback restores a known release, not just older weights",
        body: [
          "A safe rollback target includes model version, preprocessing, code/image, feature contract, configuration, threshold, and dependencies. If v11 expects schema 3 and the database migrated irreversibly to schema 4, pointing the model alias backward may fail. Compatibility must be planned before release.",
          "Rollback criteria should be machine-observable where possible: error rate, p99 latency, prediction distribution, queue growth, business guardrails, or critical safety events. Human authority must be clear for ambiguous harm. Preserve the previous deployment until the new release passes the observation window.",
          "After rollback, keep the failed version and evidence for incident review; do not rewrite registry history. Mark it blocked/quarantined with reason and prevent automated re-promotion until resolved."
        ],
        code: code("python", "client = MlflowClient()\nversion = client.get_model_version_by_alias(\"fraud_risk\", \"candidate\")\nassert version.version == approved_record.model_version\nassert approved_record.validation_digest == load_report(version).digest\n\nrelease_id = deploy_immutable_version(\n    model_uri=f\"models:/fraud_risk/{version.version}\",\n    image_digest=approved_record.image_digest,\n    config_digest=approved_record.config_digest,\n    rollback_release=current_release.id\n)\nverify_replicas_loaded(release_id, expected_model_version=version.version)", [
          "The mutable alias is immediately resolved and compared with the approved immutable version.",
          "Validation evidence is digest-checked.",
          "Model, image, config, and rollback are bound into one release.",
          "Actual replicas are verified rather than trusting registry state."
        ], "It prevents alias races, unapproved model substitution, and model-only rollback assumptions."),
        check: { question: "Why retain a failed model version after rollback?", answer: "Its immutable artifacts and evidence support root-cause analysis, audit, and controls preventing accidental re-release." }
      }
    ],
    glossary: [
      ["Model registry", "Controlled catalog of registered models, versions, metadata, and lifecycle pointers."],
      ["Registered model", "Named family containing model versions."],
      ["Model version", "Immutable model artifact entry tied to source lineage."],
      ["Alias", "Mutable human-readable pointer to a model version."],
      ["Tag", "Searchable descriptive metadata attached to a model or version."],
      ["Promotion", "Evidence-backed transition of a candidate toward production use."],
      ["Approval record", "Auditable actor, evidence, decision, and conditions authorizing a transition."],
      ["Desired state", "Declared deployment target that controllers attempt to realize."],
      ["Actual state", "Versions and configuration truly running on replicas."],
      ["Quarantine", "State preventing a failed or suspect version from promotion."],
      ["Rollback release", "Complete known-good behavior stack restored after failure."]
    ],
    exercise: {
      duration: 35,
      title: "Design a registry promotion and rollback workflow",
      brief: "Models v21–v24 exist; v24 passed average metrics but lacks a security test, and production currently serves v22 with policy p7.",
      parts: [
        "Define registered model, version tags, aliases, and permissions.",
        "Specify evidence needed to move `candidate` and `champion`.",
        "Design deployment ordering that avoids alias/replica split brain.",
        "Create a complete rollback record and quarantine process."
      ],
      solution: "Keep all versions immutable with run/data/code lineage. v24 can be tagged incomplete but must not receive a promotable alias until the security gate passes. Training identities may create versions, not move production aliases. Resolve the approved version into a release manifest, deploy to canary pinned by number, verify replicas and guardrails, then update controlled pointers/traffic. Rollback restores the prior image, model v22, feature/schema compatibility, config, and p7; preserve v24 and block re-promotion with incident reason."
    },
    sources: { core: ["mlflowRegistry","mlflowTracking"], deep: ["dockerImages","kubernetesDeploy"] },
    quiz: [
      { concept:"Model version", prompt:"A model artifact’s bytes change while registry version remains 12. What invariant was violated?", answer:0, options:[
        ["A version should identify immutable artifact content.","Correct. Create a new version."],
        ["Aliases must never move.","Aliases are designed to move."],
        ["Tags must contain labels.","Tags are descriptive metadata."],
        ["Every model must have 12 parameters.","Version numbers do not indicate size."]
      ]},
      { concept:"Aliases", prompt:"The `champion` alias moves from v8 to v9. Which reference remains stable for an old incident?", answer:2, options:[
        ["`models:/risk@champion`","It now resolves to v9."],
        ["The string ‘latest.’","It is mutable and ambiguous."],
        ["The immutable version v8 and release digest recorded in the trace.","Correct."],
        ["The current UI sort order.","UI order is not historical identity."]
      ]},
      { concept:"Tags", prompt:"A user edits tag `approved=true`. Does that prove governance approval?", answer:1, options:[
        ["Yes, every tag is digitally signed.","Ordinary tags are mutable metadata."],
        ["No; use protected workflow and auditable approval evidence.","Correct."],
        ["Yes, if the model has high accuracy.","Quality does not authorize use."],
        ["No, because tags cannot contain text.","They can."]
      ]},
      { concept:"Desired vs actual", prompt:"Registry alias points to v15, but half the replicas report v14. What is true?", answer:3, options:[
        ["The registry proves all traffic uses v15.","Actual replicas disagree."],
        ["v14 is deleted automatically.","No such behavior follows."],
        ["AUC must be identical.","Version behavior may differ."],
        ["Desired/reference state and actual serving state are inconsistent.","Correct. CD must reconcile or halt traffic."],
      ]},
      { concept:"Promotion", prompt:"A candidate passes model metrics but fails its load test. Should it receive full traffic?", answer:0, options:[
        ["No; serving capacity is part of release evidence.","Correct."],
        ["Yes; only offline accuracy matters.","Operational failure makes the model unusable."],
        ["Yes; the registry will add replicas automatically.","Registry state is not orchestration."],
        ["No; models may never be deployed.","Validated candidates can be deployed after all gates pass."]
      ]},
      { concept:"Rollback", prompt:"A rollback switches only model weights but leaves an incompatible new feature schema. What can happen?", answer:2, options:[
        ["The old model automatically learns the schema.","Serving does not retrain."],
        ["Only dashboard colors change.","Input semantics can fail catastrophically."],
        ["The old model receives missing or misordered features and remains broken.","Correct. Roll back the complete release."],
        ["The alias becomes immutable.","Alias behavior is separate."]
      ]},
      { concept:"Permissions", prompt:"Which identity should be allowed to create experiment versions but not move `champion`?", answer:1, options:[
        ["The public anonymous user.","They should not create trusted artifacts."],
        ["The training pipeline role.","Correct. Separate creation from production promotion."],
        ["Every model consumer.","Consumers need read/use, not promotion."],
        ["No identity at all.","Controlled pipelines still need functionality."]
      ]}
    ]
  });

  register({
    id: 35,
    centralQuestion: "A prediction changed. Was it code, data, model, configuration, or the lineage between them?",
    objective: "Version code, data, models, configuration, prompts, and schemas as a connected lineage graph; choose immutable references, compatible changes, and reproducible release identities.",
    sections: [
      {
        id: "version-surfaces",
        title: "One version number cannot identify a distributed behavior",
        body: [
          "Code versioning records source changes and review history. Data versioning identifies the exact source snapshot, partitions, labels, and sometimes transformation output. Model versioning identifies fitted parameters and packaging. Configuration versioning captures thresholds, feature flags, timeouts, resource settings, prompts, and retrieval parameters that can change behavior without code.",
          "An API or schema version defines the meaning of exchanged data. A container image digest identifies userspace code and dependencies. For LLM systems, model/provider revision, system prompt, tool schema, embedding model, index build, reranker, and guardrail policy all matter. A release ID binds these components rather than pretending model v7 explains everything.",
          "Use immutable digests or versions for execution; use aliases/branches for human workflow. Record both the friendly reference and its resolved identity. Avoid embedding secrets in versioned config; version secret names and rotation policy while values remain in a secret store."
        ],
        table: table("Version surface and downstream effect", ["Surface", "Example change", "Possible effect"], [
          ["Code", "Feature bug fix", "Input values and latency"],
          ["Data", "New population/month", "Parameters and prevalence"],
          ["Model", "New fitted artifact", "Ranking/calibration"],
          ["Config", "Threshold 0.7→0.5", "Alert volume without weight change"],
          ["Schema", "SAR→halalas", "100× semantic error"],
          ["Prompt/index", "Policy wording/chunk build", "Tool calls and groundedness"]
        ]),
        check: { question: "Why is a Git commit alone not enough to reproduce an ML prediction?", answer: "The result also depends on data, fitted artifacts, environment, configuration, schemas, and possibly external model/index versions." }
      },
      {
        id: "data-versioning",
        title: "Data versions identify evidence, not just files",
        body: [
          "A useful data version records source snapshot or transaction version, extraction query, cutoff time, schema, row/entity counts, quality results, label definition and maturity, and split manifest. Content hashes work for immutable files; database tables may use snapshot IDs, time travel, or materialized manifests. A mutable path is a location, not a version.",
          "Large datasets need not be copied for every experiment if the storage layer preserves immutable snapshots or reproducible content addresses. Reference data—currency rates, category maps, entity-resolution rules—must be versioned too. A small changed lookup can alter millions of feature rows.",
          "Privacy retention can conflict with perfect replay. Store authorized derivation metadata and aggregated evidence, apply deletion policy, and document when exact reproduction is no longer permitted. Governance may require reproducibility within a controlled retention window rather than forever."
        ],
        example: "A churn model’s training table is unchanged by name, but identity-resolution rules merge 8% of customers. Labels, group splits, and features all change. Version the identity rules and canonical mapping alongside the table snapshot; otherwise ‘same data’ is false.",
        failure: "Versioning only the raw source while transformations use uncommitted notebook cells leaves derived evidence unreproducible. Code and execution lineage must connect raw snapshot to feature snapshot.",
        check: { question: "Why does a split manifest deserve its own digest?", answer: "The same data can yield different evaluation evidence depending on entity/time assignment; the manifest proves the actual partitions." }
      },
      {
        id: "lineage-graph",
        title: "Lineage answers impact and reconstruction questions",
        body: [
          "Lineage forms a directed graph: sources and reference data feed transformations; transformations produce features; a run consumes features and code; a model version comes from the run; a release binds model, image, and configuration; predictions and monitoring reference the release. Backward traversal reconstructs a result. Forward traversal identifies what a corrupted source or vulnerable dependency affected.",
          "Capture lineage automatically in pipelines where possible, but validate semantic links. A job can record that it read a table without knowing which rows and cutoff applied. Attach manifest/digest and query parameters. Avoid a lineage graph full of `latest` pointers whose resolved contents are lost.",
          "Compatibility policy classifies changes. Adding an optional field can be backward compatible; changing units or category meaning is breaking even if type stays numeric. Consumers should declare supported contract versions and fail deliberately on incompatible input."
        ],
        code: code("json", "{\n  \"release_id\": \"risk-prod-2026-10-15.2\",\n  \"code_commit\": \"8d91...\",\n  \"image_digest\": \"sha256:a17...\",\n  \"data_snapshot\": \"feature-store@txn-48122\",\n  \"split_digest\": \"sha256:921...\",\n  \"model_version\": \"fraud_risk/24\",\n  \"input_contract\": \"fraud-request/3\",\n  \"policy_config\": \"sha256:5cc...\",\n  \"previous_release\": \"risk-prod-2026-10-02.1\"\n}", [
          "The release identity binds every behavior-bearing component.",
          "Data and split evidence remain separately traceable.",
          "The previous complete release is an explicit rollback edge."
        ], "It prevents incident response from guessing whether a change came from weights, data, code, contract, or policy."),
        check: { question: "What question does forward lineage answer after discovering a corrupted source table?", answer: "Which feature snapshots, runs, model versions, releases, predictions, and reports consumed or derived from it." }
      }
    ],
    glossary: [
      ["Code versioning", "Immutable reference and history for source changes."],
      ["Data versioning", "Identity and metadata for the exact evidence consumed."],
      ["Model versioning", "Identity for a fitted and packaged model artifact."],
      ["Configuration versioning", "Identity for behavior-changing runtime settings."],
      ["Schema version", "Versioned structure and semantics of exchanged data."],
      ["Content hash", "Digest derived from bytes/content for immutable identity."],
      ["Snapshot", "Point-in-time preserved view of data."],
      ["Lineage graph", "Directed relationships from sources through artifacts and releases."],
      ["Backward compatibility", "New producer/consumer behavior remains usable by older counterpart under contract."],
      ["Breaking change", "Change requiring coordinated consumer migration."],
      ["Impact analysis", "Forward tracing of consumers affected by a change or defect."]
    ],
    exercise: {
      duration: 35,
      title: "Trace a threshold incident through the version graph",
      brief: "Alert volume triples after a release; model weights are unchanged, while a config service and feature table both changed.",
      parts: [
        "Reconstruct the old and new release manifests.",
        "Compare feature snapshot, schema/reference versions, threshold config, and actual replica state.",
        "Draw backward and forward lineage for the first divergent component.",
        "Define rollback and compatibility checks that would have caught it."
      ],
      solution: "Resolve immutable identities rather than names. Replay a golden input through old/new features and policies. If scores match but decisions differ, threshold config is causal; if feature vectors differ, trace source/reference changes. Forward lineage finds affected releases and decisions. Roll back the complete manifest, not only the model. Add config diff/approval, feature-contract fixtures, canary alert-volume guardrail, and replica reporting of model/config/schema identities."
    },
    sources: { core: ["mlflowTracking","mlflowRegistry"], deep: ["dockerImages","jsonSchema"] },
    quiz: [
      { concept:"Release identity", prompt:"Model v5 serves with threshold p2 in one region and p3 in another. Should both use one release ID?", answer:1, options:[
        ["Yes, weights are identical.","Decision behavior differs."],
        ["No; release identity must include region-specific policy configuration.","Correct."],
        ["Yes, thresholds are not versionable.","They are behavior-bearing config."],
        ["No, because models cannot serve regions.","They can with explicit releases."]
      ]},
      { concept:"Data version", prompt:"Which is the strongest data reference?", answer:2, options:[
        ["`/data/latest.csv`","The path can change."],
        ["‘the October table’","It lacks exact cutoff and content."],
        ["Immutable snapshot/transaction plus query, schema, cutoff, and digest.","Correct."],
        ["A screenshot of row count.","It cannot reconstruct rows."]
      ]},
      { concept:"Reference data", prompt:"Currency conversion rates change but the raw transaction table does not. Can features change?", answer:0, options:[
        ["Yes; reference data is an input and must be versioned.","Correct."],
        ["No; only raw tables matter.","Derived values depend on rates."],
        ["Only if the model is a CNN.","Model family is irrelevant."],
        ["No, hashes prevent arithmetic changes.","Hashes identify content; they do not freeze unversioned references."]
      ]},
      { concept:"Split version", prompt:"Same data and model yield different validation scores after reshuffling groups. What lineage item explains the difference?", answer:3, options:[
        ["The model family name only.","It is unchanged."],
        ["The Docker logo.","Unrelated."],
        ["The public URL.","It does not encode partitions."],
        ["The split manifest/digest and seed/grouping rule.","Correct."],
      ]},
      { concept:"Forward lineage", prompt:"A poisoned document is discovered in an old index build. Which lineage traversal finds exposure?", answer:1, options:[
        ["Backward from the document to its author only.","Impact requires downstream traversal."],
        ["Forward to index versions, releases, traces, and answers that consumed it.","Correct."],
        ["Random across model versions.","Random search misses causal links."],
        ["No traversal; delete all evidence.","Preserve evidence and target remediation."]
      ]},
      { concept:"Compatibility", prompt:"A numeric field keeps its type but changes from SAR to halalas. Is this backward compatible?", answer:0, options:[
        ["No; semantics changed by 100× despite identical type.","Correct."],
        ["Yes, numeric is numeric.","Type does not capture units."],
        ["Yes, if validation ignores ranges.","That hides the break."],
        ["No, because integers can never hold money.","They can represent minor currency units when documented."]
      ]},
      { concept:"Secrets", prompt:"How should a release record a credential?", answer:2, options:[
        ["Store the secret value in Git.","That exposes it."],
        ["Embed it in the image digest string.","It remains exposed and couples rotation to image."],
        ["Reference the secret name/version policy while value remains in a secret manager.","Correct."],
        ["Print it in the deployment log.","Logs are not a secret store."]
      ]}
    ]
  });

  register({
    id: 36,
    centralQuestion: "A candidate passes unit tests. Should CI be allowed to create a releasable AI artifact?",
    objective: "Design CI for AI code and models using linting, unit/integration/data tests, security checks, artifact builds, model validation, reproducibility, provenance, and pass/fail gates.",
    sections: [
      {
        id: "ci-purpose",
        title: "Continuous integration makes every change prove it composes",
        body: [
          "CI integrates code and configuration changes frequently into a shared branch or candidate artifact. A pipeline checks formatting/lint rules, static analysis, unit tests, contract tests, dependency vulnerabilities, secret scanning, and a deterministic build. For AI changes, it also validates data schemas, feature transformations, artifact loading, behavioral fixtures, and—when a new model is proposed—production-aligned evaluation gates.",
          "Not every commit needs a full multi-hour training job. Fast PR checks protect code and small fixtures; scheduled or explicit candidate pipelines run expensive training and evaluation. The resulting model, report, image, and manifest are built once and promoted across environments rather than rebuilt differently in CD.",
          "A green pipeline means declared checks passed under a specific environment. It does not mean the use case is safe, data is representative, or business approval exists. Gates must express those requirements or leave them to a controlled later transition."
        ],
        diagram: diagram("pipeline", "AI continuous integration gates", ["Change", "Lint + unit + contract", "Data + model validation", "Security + build", "Signed candidate artifact"], [[0,1],[1,2],[2,3],[3,4]], "Promotion reuses the built candidate; it does not retrain or rebuild behind the same version."),
        check: { question: "Why build once and promote the same artifact?", answer: "Rebuilding in each environment can change dependencies or bytes, invalidating the evidence collected in CI." }
      },
      {
        id: "ai-gates",
        title: "AI gates compare behavior, not just compilation",
        body: [
          "Data gates verify required columns, types, ranges, freshness, entity uniqueness, label maturity, and drift from an approved training envelope. A schema pass alone cannot detect semantic unit changes; golden feature fixtures and distribution checks add evidence. Model gates compare candidate and incumbent on average metrics, critical slices, calibration, fairness/safety where relevant, latency, memory, and artifact size.",
          "Use confidence intervals or practical margins so random noise does not promote or block candidates arbitrarily. A candidate might require `AP improvement ≥ 0.01` while no critical slice recall drops more than 0.02 and p95 latency stays under 100 ms. Some gates are absolute floors; others are non-regression constraints.",
          "LLM gates add prompt regression, schema compliance, retrieval recall, faithfulness, jailbreak/injection suites, token cost, and judge/human-calibrated evaluations. Store failed cases as artifacts with appropriate privacy controls and feed them into future regression sets."
        ],
        table: table("CI gate families", ["Gate", "Evidence", "Failure response"], [
          ["Code", "Lint, types, unit/contract tests", "Fix change"],
          ["Data", "Schema, quality, snapshot, golden features", "Quarantine data/change"],
          ["Model", "Metrics, slices, calibration, behavior", "Reject candidate"],
          ["System", "Load, latency, memory, package scan", "Optimize or resize"],
          ["Security", "Secrets, dependencies, artifact provenance, abuse tests", "Block and remediate"],
          ["Governance", "Evidence completeness and approval eligibility", "Do not promote"]
        ]),
        failure: "Failing CI because a metric changed at the twelfth decimal creates noise; allowing a 5% critical-slice drop because the global mean rose hides harm. Tolerances and guardrails must match decision sensitivity.",
        check: { question: "Why compare a candidate with the incumbent inside CI?", answer: "Absolute quality can remain above a floor while a new release regresses important behavior; the incumbent is the actual alternative." }
      },
      {
        id: "security-build",
        title: "The artifact supply chain begins in CI",
        body: [
          "Pin dependencies and base images, verify hashes, scan known vulnerabilities, detect committed secrets, and restrict who can modify pipeline definitions. Build agents should use short-lived least-privilege credentials. Untrusted pull-request code must not receive production secrets or registry write access.",
          "Generate a software bill of materials where required, sign or attest the image/model bundle, and record source commit and build identity. Promotion verifies provenance and digest. A model pickle from an untrusted run is executable content and must not enter the registry simply because tests passed elsewhere.",
          "CI logs can leak data, prompts, tokens, and exception payloads. Redact secrets and sensitive values; retain enough identifiers and summaries for diagnosis. Artifacts need retention and access policy."
        ],
        code: code("yaml", "stages:\n  - static_checks\n  - unit_and_contract\n  - data_validation\n  - train_candidate\n  - model_validation\n  - security_and_package\n\nmodel_validation:\n  needs: [train_candidate]\n  script:\n    - python evaluate.py --candidate $CANDIDATE_URI --incumbent $INCUMBENT_URI\n    - python enforce_gates.py reports/evaluation.json\n  artifacts:\n    paths: [reports/evaluation.json, release/manifest.json]\n\npackage:\n  script:\n    - verify_trusted_model_source release/manifest.json\n    - build_image_from_lockfile\n    - scan_and_attest_image", [
          "The candidate is evaluated before it is packaged for release.",
          "Incumbent comparison is explicit.",
          "Evaluation and manifest are retained as gate evidence.",
          "Trusted source, scanning, and attestation protect the artifact path."
        ], "It prevents an unvalidated or untrusted model artifact from becoming a releasable image and preserves the evidence used by later approval/CD."),
        check: { question: "Why must untrusted PR jobs not receive production secrets?", answer: "The proposed code can print or exfiltrate any injected credential before it has been reviewed or merged." }
      },
      {
        id: "pipeline-design",
        title: "Fast feedback and strong evidence need separate lanes",
        body: [
          "PR lanes should complete quickly enough that developers use them: lint, types, unit tests, schema fixtures, small model-load tests, and secret/dependency scans. Candidate lanes may run on approved merges, schedules, or manual requests with controlled data access and expensive compute. Release lanes consume only candidate artifacts whose identity and evidence are complete.",
          "Cache dependencies safely by lock digest, but never cache mutable credentials or reuse unverified model files. Parallelize independent tests; fail fast on cheap structural defects before allocating GPUs. Preserve failed logs and reports without exposing private examples.",
          "A flaky test is a reliability defect. Quarantining it indefinitely teaches teams to ignore red pipelines. Track flake rate, reproduce root cause, and keep high-risk gates deterministic enough for governance."
        ],
        consequence: "A CI pipeline that takes six hours for every typo will be bypassed; one that tests only syntax will ship behavioral regressions. Layered lanes keep feedback usable while retaining deep candidate evidence.",
        check: { question: "Which checks should run before expensive training?", answer: "Cheap lint, types, unit, schema, secret, and configuration checks that can reject the change without consuming training compute." }
      }
    ],
    glossary: [
      ["Continuous integration", "Frequent integration of changes with automated evidence and builds."],
      ["Linting", "Static checks for code style and suspicious constructs."],
      ["Static analysis", "Reasoning about code without executing it."],
      ["Data gate", "Pass/fail criterion for schema, quality, lineage, or distribution."],
      ["Model gate", "Pass/fail criterion for predictive and behavioral quality."],
      ["Non-regression", "Requirement that a candidate not materially worsen protected behavior."],
      ["Artifact provenance", "Evidence of source, builder, inputs, and integrity."],
      ["SBOM", "Software bill of materials listing packaged components."],
      ["Attestation", "Signed statement about an artifact’s build or checks."],
      ["Build once, promote", "Use the identical validated artifact across later environments."],
      ["Flaky test", "Test whose outcome varies without relevant product change."]
    ],
    exercise: {
      duration: 90,
      title: "Design the CI contract for a credit-risk candidate",
      brief: "Training takes three hours, labels are sensitive, a pickle artifact is produced, and releases require slice, latency, and security evidence.",
      parts: [
        "Split PR, candidate, and release lanes with triggers and credentials.",
        "Define code, data, model, system, security, and evidence-completeness gates.",
        "Write candidate-versus-incumbent thresholds with tolerances and critical slices.",
        "Replace or govern unsafe serialization; design digest/provenance/attestation output.",
        "Simulate a failed slice gate, a vulnerable dependency, a flaky test, and a corrupt artifact."
      ],
      solution: "PR jobs receive no production data/secrets and run fast deterministic checks. An approved candidate job uses least-privilege data access, tracks data/split/code, trains once, evaluates against incumbent, and emits an immutable bundle. Require global gain or floor, no critical slice/calibration regression, p95/memory limits, and zero critical security findings. Prefer a safer model format or load pickle only from trusted signed provenance in isolation. Package once with locked dependencies, SBOM, digest, signature, and validation report. Every simulated failure blocks the appropriate transition and retains safe diagnostics."
    },
    sources: { core: ["mlflowTracking","mlflowRegistry","dockerfile"], deep: ["pytest","jsonSchema"] },
    quiz: [
      { concept:"CI purpose", prompt:"A Python change compiles, but feature-order fixtures fail. Should CI build a releasable candidate?", answer:1, options:[
        ["Yes, compilation is the only integration requirement.","Behavioral compatibility failed."],
        ["No; the feature contract failure can invalidate every prediction.","Correct."],
        ["Yes, if training is expensive.","Cost does not excuse a broken contract."],
        ["No, because CI may never build models.","Candidate lanes can build models after gates."]
      ]},
      { concept:"Build once", prompt:"CI validates image digest A, but CD rebuilds from floating dependencies into digest B. What is wrong?", answer:0, options:[
        ["The deployed bytes are not the artifact CI validated.","Correct. Promote A instead."],
        ["Digests should be human names only.","They are immutable content identities."],
        ["CD must always retrain.","CD should deploy validated artifacts."],
        ["Floating dependencies improve reproduction.","They weaken it."]
      ]},
      { concept:"Data gates", prompt:"Schema passes, but amount distribution shifts exactly 100× after a unit change. Which additional gate helps?", answer:2, options:[
        ["Only code formatting.","Style cannot detect semantic scale."],
        ["A larger README.","Documentation alone does not execute checks."],
        ["Range/distribution and golden-feature assertions tied to units.","Correct."],
        ["Removing data validation.","That worsens risk."]
      ]},
      { concept:"Model gates", prompt:"Candidate average AP rises 0.02, but critical-region recall falls 0.08 beyond the 0.02 guardrail. What should happen?", answer:3, options:[
        ["Promote because average AP dominates.","The declared critical gate fails."],
        ["Delete the region label.","That hides harm."],
        ["Round the drop to zero.","That falsifies evidence."],
        ["Block candidate and investigate the slice regression.","Correct."],
      ]},
      { concept:"LLM CI", prompt:"Which check specifically belongs in an LLM/RAG candidate lane?", answer:1, options:[
        ["Only Python import success.","Necessary but insufficient."],
        ["Retrieval recall, faithfulness, prompt-injection regression, schema rate, and token cost.","Correct."],
        ["Monitor brightness of training images only.","Unrelated to text/RAG behavior."],
        ["Disable all stochastic evaluation.","Use repeated/rubric-based evaluation instead."]
      ]},
      { concept:"Supply chain", prompt:"An untrusted PR can edit the pipeline and receives a registry signing key. What is the risk?", answer:0, options:[
        ["It can exfiltrate the key or attest malicious artifacts.","Correct. Separate trusted build context and short-lived permissions."],
        ["It makes gradients vanish.","This is supply-chain security."],
        ["It guarantees high latency.","Latency is not the primary risk."],
        ["It prevents source changes.","The opposite is possible."]
      ]},
      { concept:"Artifact trust", prompt:"A model pickle passes checksum verification but came from an unknown source. Should CI load it?", answer:2, options:[
        ["Yes, checksums prove benign code.","A digest proves integrity relative to bytes, not trust."],
        ["Yes, if the filename says model.","Names are not provenance."],
        ["No; require trusted provenance/signature and controlled loading or safer format.","Correct."],
        ["No, because no serialized model can ever be loaded.","Trusted formats and workflows can be safe enough."]
      ]},
      { concept:"Pipeline lanes", prompt:"Why keep fast PR checks separate from three-hour candidate training?", answer:1, options:[
        ["So PRs receive production secrets.","They should not."],
        ["To preserve rapid feedback while running deep evidence only on approved triggers.","Correct."],
        ["So model validation never happens.","It happens in the candidate lane."],
        ["To rebuild different artifacts in each lane.","Build once after validation."]
      ]},
      { concept:"Flaky tests", prompt:"A critical gate fails randomly 15% of unchanged runs. What should the team do?", answer:3, options:[
        ["Ignore all red pipelines.","That destroys gate credibility."],
        ["Retry until green and hide attempts.","That biases outcomes."],
        ["Delete the critical requirement.","The requirement may still matter."],
        ["Measure and fix nondeterminism, with temporary explicit quarantine only if risk is controlled.","Correct."],
      ]},
      { concept:"CI limits", prompt:"All automated checks pass. Does that authorize high-risk production release?", answer:0, options:[
        ["Only if the defined governance/approval transition also passes; green CI alone is insufficient.","Correct."],
        ["Yes, tests are legal approval.","Automation does not imply accountable authorization."],
        ["Yes, if model size is large.","Size is irrelevant."],
        ["No model may ever be released after CI.","CI supplies evidence for later controlled release."]
      ]}
    ]
  });
  register({
    id: 43,
    centralQuestion: "How do you expose a new model to reality without making every user part of the first experiment?",
    objective: "Choose among recreate, rolling, blue-green, canary, and shadow deployment; define traffic, compatibility, observability, promotion, and stop criteria for a model release.",
    sections: [
      {
        id: "release-risk",
        title: "Deployment changes more than a model file",
        body: [
          "A release can change preprocessing, model weights, runtime libraries, request schemas, thresholds, prompts, retrieval indexes, or routing policy. Offline validation narrows uncertainty; it cannot reproduce every production input, dependency, concurrency pattern, or human response. Deployment strategy controls how much real traffic and consequence meet the new release while that residual uncertainty is measured.",
          "Separate exposure from effect. A shadow receives copied requests but its output does not control the user experience; a canary controls a small fraction of real decisions. Shadowing is safer for decision impact, yet still creates privacy, cost, and side-effect risks. A canary provides causal operational evidence only if cohorts, routing, and concurrent product changes are controlled.",
          "Before traffic moves, prove backward compatibility or coordinate a versioned contract. A new model that requires a feature not yet emitted will fail regardless of its evaluation score. Database, feature, and event-schema migrations often need an expand–migrate–contract sequence so old and new releases can coexist."
        ],
        table: table("Deployment strategy as a risk-control decision", ["Strategy", "Traffic behavior", "Fast rollback?", "Best fit", "Main trap"], [
          ["Recreate", "Old stops, then new starts", "Redeploy old", "Noncritical/offline service", "Downtime and cold start"],
          ["Rolling", "Instances replaced gradually", "Reverse rollout", "Compatible stateless service", "Mixed-version behavior"],
          ["Blue-green", "Two complete environments; switch route", "Very fast route switch", "High assurance and spare capacity", "Double capacity and state migration"],
          ["Canary", "Small live cohort grows by gates", "Route back quickly", "Measurable online risk", "Biased cohorts or weak guardrails"],
          ["Shadow", "Copy traffic; old remains authoritative", "No user decision to undo", "Performance/behavior comparison", "Duplicated side effects or sensitive data"]
        ]),
        check: { question: "Why is a shadow not automatically risk-free?", answer: "It still processes production data, consumes capacity, may write logs, and can trigger side effects unless its permissions and sinks are isolated." }
      },
      {
        id: "strategy-mechanics",
        title: "Each strategy answers a different failure question",
        body: [
          "Recreate minimizes simultaneous versions but accepts a gap in availability. Rolling preserves capacity while Pods change, but requests may alternate between versions; session state and response contracts must tolerate that overlap. Blue-green keeps a fully provisioned old environment while the new one is verified, then changes the router. Its operational simplicity costs duplicate capacity and does not by itself solve irreversible data migrations.",
          "Canary begins with a representative, bounded cohort—often one region, tenant set, or traffic percentage—and advances only after an observation window. Gate on system metrics, model-output distributions, business guardrails, safety slices, and delayed outcomes where available. Five percent traffic is not five percent risk if that cohort contains the highest-value customers.",
          "Shadowing answers ‘what would the candidate have produced?’ without changing the authoritative response. Join incumbent and candidate traces by request ID, then compare latency, disagreement, calibration proxies, safety violations, retrieval evidence, and cost. Block writes and external tools in the shadow path."
        ],
        diagram: diagram("layers", "Progressive exposure", ["Offline gates", "Shadow copy", "1–5% canary", "25–50% expansion", "Full traffic"], [[0,1],[1,2],[2,3],[3,4]], "Every transition has an observation window, explicit gate, owner, and rollback action."),
        failure: "A canary that receives only internal staff traffic can pass while production fails on languages, long-tail inputs, geography, or scale. Define cohort representativeness and analyze slices rather than trusting the global average.",
        check: { question: "When is blue-green preferable to rolling?", answer: "When rapid whole-environment reversal and isolation matter more than duplicate capacity, especially if mixed versions are unsafe." }
      },
      {
        id: "gates",
        title: "Promotion criteria must be computable before the release begins",
        body: [
          "Write gates as comparisons with baselines and budgets: p99 latency no more than 10% worse, error rate below 0.2%, critical-slice recall above a floor, alert volume within review capacity, no new high-severity safety failures, and cost per completed task within range. Declare minimum sample size and observation duration; otherwise teams can promote after a quiet five minutes and miss daily cycles.",
          "Use both absolute limits and relative regression checks. A 50% relative error increase can still look numerically small, while an absolute SLO protects users. Conversely, an incumbent already outside SLO should not legitimize another bad release. Guardrails should include upstream and downstream dependencies so a candidate is not blamed for a shared outage—or promoted while it overloads another service.",
          "Promotion is a controlled change to routing or alias, not a rebuild. Record actor, evidence, release manifest, traffic steps, and reasons. Automated progression is appropriate for reversible low-risk gates; high-impact decisions may require human approval."
        ],
        code: code("yaml", "release: risk-model-42\nsteps:\n  - traffic: 0\n    mode: shadow\n    observe: 2h\n  - traffic: 5\n    observe: 4h\n  - traffic: 25\n    observe: 12h\ngates:\n  error_rate: '< 0.002'\n  p99_regression: '<= 0.10'\n  critical_slice_recall: '>= 0.82'\n  review_queue: '<= 900'\nrollback:\n  route_to: risk-model-41", [
          "Traffic and observation windows are explicit rather than improvised.",
          "Gates mix system, model-slice, and operational-capacity evidence.",
          "The rollback target is resolved before exposure.",
          "Shadow precedes authoritative decisions."
        ], "It prevents promotion based on a single average metric and prevents a failed release from waiting for a rollback target to be invented."),
        check: { question: "Why specify minimum duration as well as sample size?", answer: "A large burst can satisfy count quickly but miss time-dependent conditions such as cache expiry, daily load, label delay, or scheduled dependencies." }
      },
      {
        id: "decision",
        title: "The safest strategy follows reversibility, state, and consequence",
        body: [
          "For a batch scoring job, shadowing can run both models on the same snapshot, but writing both outputs into the same customer-action table would corrupt downstream work. For a stateless low-risk API, rolling may be sufficient. For a healthcare triage model, blue-green infrastructure plus a small clinician-reviewed canary can separate technical rollback from clinical oversight.",
          "No named strategy substitutes for compatibility tests, observability, or ownership. Ask what can be reversed, how quickly harm becomes visible, whether outputs cause irreversible actions, how labels mature, and which state is shared. The answer may combine strategies: shadow first, canary on a reviewed cohort, then blue-green route switch."
        ],
        example: "A recommendation candidate increases clicks by 4% but doubles complaint rate for a small-language slice. A global KPI gate would promote it; a slice safety guardrail stops expansion. The downstream consequence of ignoring the slice is not merely a metric defect—it concentrates harm on a group hidden by volume.",
        check: { question: "What makes a deployment strategy adequate?", answer: "It limits exposure to the release's plausible failures, produces decision-quality evidence, and supports a tested reversal before unacceptable harm." }
      }
    ],
    glossary: [
      ["Recreate deployment", "Stopping the old release before starting the new one."],
      ["Rolling deployment", "Gradually replacing instances while both versions may coexist."],
      ["Blue-green deployment", "Maintaining old and new environments and switching traffic between them."],
      ["Canary deployment", "Progressively exposing a bounded live cohort under gates."],
      ["Shadow deployment", "Copying production requests to a non-authoritative candidate."],
      ["Exposure", "Amount and composition of real workload reaching a candidate."],
      ["Effect", "User or system consequence caused by the candidate output."],
      ["Observation window", "Minimum time over which release evidence is collected."],
      ["Promotion gate", "Predeclared criterion required to expand exposure."],
      ["Expand–migrate–contract", "Compatibility sequence that lets old and new schemas coexist during migration."]
    ],
    exercise: {
      duration: 40,
      title: "Release a credit-decision model without uncontrolled exposure",
      brief: "Version 18 uses a new derived feature, lowers median latency, and changes approval decisions for 7% of applicants. Decisions are legally consequential and outcomes mature after 90 days.",
      parts: [
        "Map model, feature, schema, policy, and infrastructure changes and their reversibility.",
        "Choose and sequence shadow, blue-green, canary, or rolling strategies.",
        "Define cohorts, leading indicators, critical slices, capacity guards, and delayed-outcome evidence.",
        "Write promotion, stop, and rollback criteria with owners."
      ],
      solution: "Deploy compatible feature emission first and verify parity. Run an isolated no-write shadow to compare decisions, latency, missingness, and slice disagreement. Keep blue and green complete environments for rapid route reversal; expose a small representative, human-reviewed canary only after governance approval. Gate on contract errors, p99, approval-rate shifts, protected/critical slices, manual-review capacity, explanation availability, and leading risk indicators; preserve a 90-day post-release evaluation. Stop and route to v17 on any critical violation. Record every routing step and evidence."
    },
    sources: { core: ["kubernetesDeploy","kubernetesService"], deep: ["azureWellArchitectedAI","otel"] },
    quiz: [
      { concept:"Shadow deployment", prompt:"A shadow fraud model sends decline messages to copied requests. What is wrong?", answer:2, options:[
        ["Nothing; shadow outputs should act normally.","A shadow must not become authoritative."],
        ["It should receive more traffic first.","Exposure does not fix side effects."],
        ["The shadow path has side effects and can harm users despite copied routing.","Correct."],
        ["Fraud models cannot be shadowed.","They can if data and side effects are controlled."]
      ]},
      { concept:"Canary cohort", prompt:"A 5% canary includes only employees, then passes. What evidence is missing?", answer:0, options:[
        ["Representative production slices and workload behavior.","Correct."],
        ["A larger Docker image.","Image size does not repair cohort bias."],
        ["Removal of all gates.","Gates are required."],
        ["A second test set used for tuning.","That would contaminate evaluation."]
      ]},
      { concept:"Blue-green", prompt:"Which condition most favors blue-green over rolling?", answer:3, options:[
        ["No spare capacity and harmless downtime.","That favors recreate or rolling."],
        ["A desire for mixed versions.","Blue-green isolates them."],
        ["An irreversible schema deletion first.","No deployment pattern makes that safe."],
        ["Need for an immediate whole-environment route reversal.","Correct."],
      ]},
      { concept:"Promotion gate", prompt:"Canary error rate is within limit but critical-language refusal failures triple. What should happen?", answer:1, options:[
        ["Promote because aggregate errors pass.","A critical slice gate failed."],
        ["Stop expansion and investigate the slice regression.","Correct."],
        ["Delete slice telemetry.","That hides harm."],
        ["Increase traffic to average it away.","More exposure increases harm."],
      ]},
      { concept:"Rolling deployment", prompt:"Why must a rolling release preserve contract compatibility?", answer:2, options:[
        ["Only one version ever runs.","Versions overlap during rollout."],
        ["Kubernetes rewrites response schemas.","It does not."],
        ["Old and new instances may receive adjacent requests during the same period.","Correct."],
        ["Compatibility eliminates monitoring.","Monitoring remains necessary."]
      ]},
      { concept:"Observation window", prompt:"A canary receives 50,000 requests in five minutes and auto-promotes, but cache-expiry failures occur hourly. What was underspecified?", answer:0, options:[
        ["Minimum observation duration and relevant operational cycles.","Correct."],
        ["Model parameter count.","It does not capture the temporal failure."],
        ["Number of training epochs.","This is release evidence."],
        ["The HTTP method.","Not the cause."]
      ]},
      { concept:"Reversibility", prompt:"A release writes predictions into an irreversible payment action. What additional control is most important?", answer:3, options:[
        ["Call it shadow while preserving writes.","The name does not remove effects."],
        ["Use only average latency.","Decision harm is the main risk."],
        ["Remove human review to reduce delay.","That increases consequence."],
        ["Isolate no-write evaluation, add approval/bounds, and design compensating action.","Correct."]
      ]}
    ]
  });

  register({
    id: 44,
    centralQuestion: "Production is degrading now—which exact state can you reverse, and what damage will remain after the switch?",
    objective: "Build coordinated model, application, configuration, data, prompt, and index rollback; define immutable targets, triggers, drills, compatibility, and post-rollback recovery.",
    sections: [
      {
        id: "rollback-unit",
        title: "Rollback must restore a known behavior stack",
        body: [
          "A model rarely operates alone. Its behavior depends on feature transforms, runtime image, request schema, threshold, prompt, retrieval index, safety policy, and external dependencies. Repointing only the model alias may combine old weights with a new incompatible scaler or feature order. A rollback target therefore identifies a tested release manifest, not merely ‘the previous model.’",
          "Model rollback restores a prior model artifact; application rollback restores serving code; configuration rollback restores thresholds, routing, prompts, or resource settings. Data and schema changes are harder: an overwritten table or destructive migration may not be reversible on incident timescales. Prefer backward-compatible changes and versioned, immutable artifacts so routing can move without reconstruction.",
          "Rollback stops additional exposure; it does not erase decisions already made, messages sent, tools invoked, or data written. Incident plans need compensation: re-score affected cases, cancel queued actions, notify owners, preserve evidence, and determine whether users require remediation."
        ],
        table: table("Rollback surfaces", ["Surface", "Safe target", "Compatibility question", "Residual consequence"], [
          ["Model", "Pinned version/digest", "Old preprocessing available?", "Past decisions remain"],
          ["Application", "Prior image digest", "API/database schema compatible?", "In-flight calls may finish"],
          ["Configuration", "Versioned config", "Secrets/endpoints still valid?", "Cached config may lag"],
          ["Prompt/index", "Prompt + corpus snapshot", "Tool/schema and embeddings aligned?", "Prior generated outputs remain"],
          ["Data migration", "Snapshot/forward repair", "Can old code read new schema?", "Writes may be irreversible"]
        ]),
        check: { question: "Why is ‘set alias to version 17’ insufficient as a full rollback plan?", answer: "Version 17 may depend on different code, preprocessing, schema, config, prompt, or index; the whole compatible release must be identified." }
      },
      {
        id: "triggers",
        title: "Trigger on user risk, not only obvious process failure",
        body: [
          "Rollback triggers include elevated errors, SLO burn, schema violations, output-distribution shifts, safety events, critical-slice regression, business loss, and unexplained disagreement. A server can return HTTP 200 quickly while issuing materially wrong decisions, so system health alone cannot define safety.",
          "Declare automatic versus human-authorized triggers. Fast, high-confidence, reversible signals—crash loops, contract failure, extreme latency—often justify automatic traffic reversal. Ambiguous business shifts may require incident review. A kill switch can disable a tool, feature, model route, or prompt separately, limiting blast radius while diagnosis continues.",
          "Use hysteresis and evidence windows to avoid oscillation, but never make a window so long that catastrophic failures continue. Severity determines urgency: a confirmed unsafe tool action stops immediately; a modest conversion change may wait for sufficient samples."
        ],
        diagram: diagram("flow", "Rollback control loop", ["Detect + correlate", "Classify severity", "Stop/route/disable", "Verify recovery", "Remediate + learn"], [[0,1],[1,2],[2,3],[3,4]], "Preserve evidence before and during reversal; recovery verification is a separate gate."),
        failure: "Waiting for mature labels before rolling back a blatant contract or safety failure confuses outcome evaluation with incident containment. Use the strongest timely evidence appropriate to the failure.",
        check: { question: "Which failure can usually trigger automatic rollback most safely?", answer: "A well-instrumented, high-confidence, reversible condition such as widespread schema failures or severe SLO burn, with a known healthy target." }
      },
      {
        id: "execute",
        title: "A rollback procedure is executable evidence, not a paragraph",
        body: [
          "Precompute the target, command or routing change, permissions, owners, communication path, and validation queries. The procedure should work during partial outages and not depend on the broken service. Use immutable digests so a tag cannot resolve differently during the incident.",
          "Sequence matters. Stop new harmful actions, preserve correlation IDs and samples, shift traffic or disable the risky capability, drain in-flight work according to consequence, verify system and model/business guardrails, then communicate status. If a schema is forward-compatible, old code can read it; if not, prefer a forward fix or compatibility adapter over a destructive database reversal.",
          "Rollback drills expose expired credentials, missing artifacts, stale documentation, and unrealistic recovery objectives. Exercise model, app, configuration, and dependency failure—not only container restart. Measure time to detect, decide, execute, and verify."
        ],
        code: code("python", "target = registry.resolve_release('production-previous')\nassert target.image_digest and target.model_digest\nassert compatibility.can_read_current_schema(target)\nrouter.set_weight(current=0, target=100, change_id=INCIDENT_ID)\nprobe.wait_until_healthy(target, timeout_seconds=180)\nassert guardrails.within_recovery_bounds(window='10m')\naudit.record('rollback-verified', target=target.id)", [
          "The alias resolves to a complete immutable release before action.",
          "Schema compatibility is checked before old code receives traffic.",
          "Routing is tied to an incident/change record.",
          "Health and behavioral recovery are verified separately.",
          "The final state becomes auditable evidence."
        ], "It prevents a hurried model-only switch, rejects an unreadable old release, and avoids declaring victory merely because the process restarted."),
        check: { question: "Why should rollback tooling work independently of the application API?", answer: "The application or its dependencies may be the failing component; operators still need a reliable control plane." }
      },
      {
        id: "after",
        title: "Recovery ends the outage; remediation closes the incident",
        body: [
          "After reversal, compare error, latency, score distribution, safety, business, and downstream queue metrics with the known baseline. Watch for stale caches, mixed replicas, delayed messages, and retry storms. A green deployment controller is not proof that user-facing behavior recovered.",
          "Identify affected requests from release ID and correlation lineage. Decide whether to re-run, compensate, notify, or invalidate outputs. Freeze evidence, write a blameless timeline, locate the failed control, and create a tested prevention action. Promotion remains blocked until root cause and guardrails are updated.",
          "Sometimes roll-forward is safer: the prior version cannot read the new schema, a security vulnerability affects it, or the incident is confined to a small configuration defect. The decision criterion is fastest safe restoration with understood residual risk—not loyalty to the word rollback."
        ],
        example: "A prompt update causes an agent to call a ticket-closing tool incorrectly. Reverting the prompt prevents new calls, but already closed tickets remain. Use trace IDs to reopen affected tickets, notify service owners, restrict the tool while investigating, and add an action-policy regression test.",
        check: { question: "When can roll-forward be safer than rollback?", answer: "When the old release is incompatible or vulnerable and a small, bounded forward correction restores service with less risk." }
      }
    ],
    glossary: [
      ["Rollback", "Restoring traffic or behavior to a known acceptable release state."],
      ["Release manifest", "Immutable mapping of model, code, configuration, data contract, and policy."],
      ["Kill switch", "Control that rapidly disables a capability or route."],
      ["Hysteresis", "Different enter/exit conditions that reduce oscillation."],
      ["Compensating action", "Action that repairs or offsets an irreversible prior effect."],
      ["Roll-forward", "Deploying a corrective new change instead of restoring an old release."],
      ["Recovery verification", "Evidence that both service and decision behavior returned within bounds."],
      ["Blast radius", "Scope of users, data, regions, or actions affected by failure."],
      ["Rollback drill", "Controlled exercise of reversal procedures and dependencies."],
      ["RTO", "Target time to restore an acceptable service state."]
    ],
    exercise: {
      duration: 40,
      title: "Run a tabletop rollback for a RAG support agent",
      brief: "A new prompt, reranker, application image, and index shipped together. Error rate is normal, but the agent has begun closing tickets without valid approval.",
      parts: [
        "List all rollback surfaces, immutable targets, and shared state.",
        "Define immediate containment, automatic/human triggers, and a kill switch.",
        "Write the ordered rollback and recovery-verification runbook.",
        "Design affected-case discovery, compensation, and prevention evidence."
      ],
      solution: "Disable the close-ticket tool first while retaining read-only answers; preserve traces and route IDs. Resolve the previous complete prompt/index/image/model/config manifest and check ticket-schema compatibility before shifting traffic. Drain or cancel queued tool calls, verify refusal and approval-policy tests, latency/errors, retrieval quality, and ticket-action rate. Query all traces under the bad release, reopen or review tickets, notify operations, and retain an incident timeline. Separate changes in the next release and add tool-policy regression, canary action limits, and a tested kill switch."
    },
    sources: { core: ["mlflowRegistry","kubernetesDeploy"], deep: ["otelContext","azureWellArchitectedAI"] },
    quiz: [
      { concept:"Release rollback", prompt:"The prior model is restored but predictions are nonsense because the new scaler remains. What failed?", answer:1, options:[
        ["The model needed more replicas.","Capacity does not align transforms."],
        ["Rollback covered weights, not the compatible behavior stack.","Correct."],
        ["HTTP should use GET.","Method choice is unrelated."],
        ["Old models cannot be restored.","They can when artifacts are preserved."]
      ]},
      { concept:"Residual harm", prompt:"Traffic is routed away from a faulty loan model. Is the incident complete?", answer:3, options:[
        ["Yes; routing erases previous decisions.","Past effects remain."],
        ["Yes, if CPU is normal.","System health does not remediate decisions."],
        ["No; the bad model must be retrained immediately.","Containment and investigation precede any candidate."],
        ["No; identify affected decisions, compensate, verify, and preserve evidence.","Correct."]
      ]},
      { concept:"Automatic trigger", prompt:"Which signal most strongly supports immediate automatic traffic reversal?", answer:0, options:[
        ["A validated 80% request-schema failure with a healthy pinned target.","Correct."],
        ["One ambiguous complaint.","It merits review but may lack confidence."],
        ["A quarterly KPI moves 0.1%.","Causality and urgency are unclear."],
        ["Training loss improved.","It does not describe production failure."]
      ]},
      { concept:"Data compatibility", prompt:"Old application code cannot read a destructive new database schema. What is usually safer?", answer:2, options:[
        ["Route old code anyway.","It will fail or corrupt state."],
        ["Delete the database.","Destructive and unnecessary."],
        ["Use a forward compatibility fix/adapter while containing exposure.","Correct."],
        ["Rename the model alias only.","The incompatibility remains."]
      ]},
      { concept:"Recovery verification", prompt:"The deployment controller is green after rollback. Which evidence is still required?", answer:1, options:[
        ["None; green means decisions are correct.","It proves only controller health."],
        ["User-path, model/safety, business, queue, and dependency metrics return within bounds.","Correct."],
        ["A larger training dataset.","Not immediate recovery evidence."],
        ["Deletion of incident logs.","Logs must be preserved."]
      ]},
      { concept:"Kill switch", prompt:"An agent answers safely but its write tool is misbehaving. What containment is best?", answer:0, options:[
        ["Disable the write capability while preserving safe read-only service.","Correct and limits blast radius."],
        ["Increase tool permissions.","That increases risk."],
        ["Hide the action metric.","That removes detection."],
        ["Retrain every underlying model.","The tool path needs immediate containment."]
      ]},
      { concept:"Rollback drill", prompt:"Why practice rollback before an incident?", answer:3, options:[
        ["To change production without records.","Drills should be controlled and audited."],
        ["To guarantee no future incidents.","No drill can guarantee that."],
        ["To replace monitoring.","Detection remains necessary."],
        ["To expose missing artifacts, permissions, dependencies, and unrealistic recovery timing.","Correct."]
      ]}
    ]
  });

  register({
    id: 45,
    centralQuestion: "Every dashboard is green—so why are customers still receiving bad decisions?",
    objective: "Design layered system, data, model, and business monitoring with actionable signals, baselines, slices, label-aware evaluation, alert ownership, and causal incident diagnosis.",
    sections: [
      {
        id: "layers",
        title: "Healthy infrastructure is necessary and radically insufficient",
        body: [
          "System monitoring asks whether computation is available: request rate, errors, latency, saturation, restarts, queue age, dependency health, and resource use. Data monitoring asks whether inputs remain valid and representative: schema, missingness, ranges, freshness, categories, volumes, and distribution. Model monitoring asks whether scores, decisions, calibration, ranking, slices, and eventual labeled performance remain acceptable. Business monitoring asks whether the workflow creates value without unacceptable harm or operational burden.",
          "These layers interact causally. An upstream timestamp stops updating; freshness fails, features become stale, scores compress, alerts fall, fraud losses rise. CPU and HTTP metrics can remain normal throughout. A useful dashboard lets an engineer traverse that chain by release, data version, cohort, and time.",
          "Monitoring is not a wall of charts. Each signal has a purpose, expected range, owner, response, and escalation. High-cardinality dimensions need deliberate controls so cardinality cost does not erase the very slice needed in an incident."
        ],
        diagram: diagram("layers", "Four monitoring layers", ["System: can it run?", "Data: are inputs valid?", "Model: are decisions sound?", "Business: is value safe?"], [[0,1],[1,2],[2,3]], "Correlate layers by time, request, cohort, and immutable release identity."),
        check: { question: "How can business harm occur while system metrics remain green?", answer: "The service may respond quickly and successfully with stale, shifted, miscalibrated, or policy-inappropriate predictions." }
      },
      {
        id: "signals",
        title: "Choose leading and lagging indicators around the failure mechanism",
        body: [
          "Leading indicators arrive early: contract failures, missingness, feature freshness, score-distribution change, retrieval no-result rate, refusal rate, queue age, or human override. Lagging indicators may be decisive but delayed: confirmed fraud, equipment failure, repayment, readmission, or retained revenue. Use leading indicators for containment and lagging outcomes for true performance assessment.",
          "Monitor slices that correspond to meaningful exposure: geography, product, device, language, model route, acquisition channel, risk band, or protected group where lawful and governed. A global average can improve while a critical slice collapses. Avoid uncontrolled slice hunting: predeclare critical slices and use statistical uncertainty, sample sufficiency, and multiple-comparison awareness.",
          "Baselines include training reference, recent production, seasonal history, control cohort, and incumbent release. No single baseline answers every question. Comparing December traffic only with July may trigger expected seasonality; comparing only with yesterday can normalize slow degradation."
        ],
        table: table("Monitoring signal design", ["Layer", "Signal", "Early/late", "Likely response"], [
          ["System", "p99 latency, queue age, errors", "Early", "Scale, shed load, inspect dependency"],
          ["Data", "schema, missingness, range, freshness", "Early", "Quarantine/fallback/source repair"],
          ["Model", "score/decision distribution, slice metrics", "Early + late", "Pause release, threshold or model diagnosis"],
          ["Business", "review load, loss, completion, harm", "Often late", "Workflow/policy/product intervention"],
          ["LLM/RAG", "retrieval success, faithfulness, safety, tokens", "Mixed", "Index/prompt/model/guardrail diagnosis"]
        ]),
        failure: "Alerting on every statistically detectable distribution change creates fatigue. A useful alert combines magnitude, persistence, affected volume, business criticality, and a response path.",
        check: { question: "Why retain both training and recent-production baselines?", answer: "Training comparison detects departure from learned conditions; recent production distinguishes sudden incidents from gradual or seasonal change." }
      },
      {
        id: "labels",
        title: "Delayed and selective labels change what can honestly be claimed",
        body: [
          "When outcomes arrive weeks later, real-time accuracy is unknowable. Publish label coverage and maturity alongside performance: what fraction is labeled, which prediction dates have matured, and whether outcome observation depends on the model action. A performance estimate based only on rapidly resolved cases can be systematically biased.",
          "Proxy metrics—human overrides, complaint rate, downstream rules, retrieval support, score distribution—can warn quickly but are not substitutes for target outcomes. Calibrate their relationship to final labels and name them as proxies. Backfill matured cohorts rather than mixing fresh incomplete outcomes with old complete ones.",
          "Champion–challenger comparisons need matched exposure. A challenger routed to low-risk cases cannot be compared naively with an incumbent handling all traffic. Log assignment propensity/cohort and use randomized or carefully adjusted evaluation where feasible."
        ],
        example: "A collections model appears to have higher repayment after deployment, but it was routed only to customers reachable by phone. Reachability caused both assignment and repayment. Without the routing cohort, the dashboard attributes selection to model quality.",
        check: { question: "What must accompany a displayed production recall estimate?", answer: "Outcome definition, label maturity window, coverage, evaluated cohort, uncertainty, and how prediction decisions affected label observation." }
      },
      {
        id: "alerts",
        title: "An alert is a contract to act",
        body: [
          "Define severity, threshold, evaluation window, deduplication, owner, runbook, and escalation. Page only when timely human action is required; route lower urgency signals to tickets or review. Composite alerts are often more specific: rising missingness plus score collapse plus business-volume change points to input failure more strongly than any one noisy series.",
          "Correlate incidents with releases, configuration changes, upstream deployments, traffic shifts, and dependency events. Preserve examples within privacy rules. When a threshold fires, first confirm telemetry integrity—an instrumentation change can look like a model incident—but do not let that check postpone containment of high-severity harm.",
          "Review monitors themselves. Track alert precision, missed incidents, acknowledgement and recovery time, and stale dashboards. A silent metric exporter is a failure mode; heartbeat and end-to-end synthetic checks verify the observation path."
        ],
        code: code("python", "alert = (\n    feature_freshness_minutes > 30\n    and score_p50 < baseline_score_p50 * 0.55\n    and predictions_per_minute > 100\n)\nif alert:\n    page(\n        owner='fraud-oncall',\n        severity='SEV-1',\n        runbook='runbooks/stale-features',\n        release_id=current_release,\n        upstream_snapshot=feature_snapshot,\n    )", [
          "The alert encodes a plausible causal signature rather than one noisy metric.",
          "A volume floor avoids paging on tiny samples.",
          "Ownership and runbook make the signal actionable.",
          "Release and upstream identities accelerate correlation."
        ], "It reduces unowned alert noise and prevents responders from losing time reconstructing which model and feature state were active."),
        check: { question: "What distinguishes a page from a dashboard warning?", answer: "A page asserts that a named responder must take time-critical action using a defined runbook." }
      }
    ],
    glossary: [
      ["System monitoring", "Observation of service availability, latency, errors, and resource behavior."],
      ["Data monitoring", "Observation of input contracts, quality, freshness, volume, and distributions."],
      ["Model monitoring", "Observation of outputs, decisions, slices, calibration, and labeled performance."],
      ["Business monitoring", "Observation of workflow value, costs, capacity, and harm."],
      ["Leading indicator", "Timely signal that can precede confirmed outcome impact."],
      ["Lagging indicator", "Outcome-based signal available after consequence matures."],
      ["Baseline", "Reference distribution or behavior used for comparison."],
      ["Label coverage", "Fraction and composition of predictions with observed outcomes."],
      ["Alert fatigue", "Reduced response quality caused by excessive unactionable alerts."],
      ["Synthetic check", "Controlled request used to verify an end-to-end path."],
      ["Telemetry heartbeat", "Signal that verifies the monitoring pipeline itself is alive."]
    ],
    exercise: {
      duration: 35,
      title: "Design monitoring for predictive maintenance",
      brief: "A model scores factory machines every minute. Failure labels mature after 30 days; sensors occasionally freeze while continuing to send valid numeric values.",
      parts: [
        "Define system, data, model, and business signals with owners and baselines.",
        "Create a frozen-sensor leading indicator and trace its downstream consequences.",
        "Design mature-cohort performance and slice views.",
        "Write one page-worthy alert and one ticket-worthy review with runbooks."
      ],
      solution: "System: scoring completion, queue lag, latency, errors. Data: event time, freshness, repeated-value runs, cross-sensor consistency, missingness/range. Model: score distribution, alert rate, calibration/recall on 30-day-mature cohorts by factory/machine type. Business: unplanned downtime, inspection load, prevented failures, false maintenance cost. Page on sustained sensor freeze plus score/coverage impact for active machines; quarantine or fall back and notify data/on-call owners. Ticket a gradual distribution shift with sufficient sample and no immediate SLO/harm. Show label coverage and routing exposure on every outcome metric."
    },
    sources: { core: ["otel","otelContext"], deep: ["azureWellArchitectedAI","sklearnMetrics"] },
    quiz: [
      { concept:"Monitoring layers", prompt:"A scoring API has 99.99% availability but fraud losses surge after a timestamp feed freezes. Which layer detected too little?", answer:2, options:[
        ["Only CPU utilization.","CPU can remain normal."],
        ["Only HTTP status codes.","Successful wrong predictions return 200."],
        ["Data freshness and downstream model/business behavior.","Correct."],
        ["Container image size.","Not the causal signal."]
      ]},
      { concept:"Delayed labels", prompt:"Repayment labels take 90 days. What should a week-one dashboard call override rate?", answer:1, options:[
        ["True default accuracy.","It is not the final outcome."],
        ["An early proxy shown separately from mature-cohort performance.","Correct."],
        ["Proof of no drift.","Overrides cannot establish that."],
        ["A training parameter.","It is a production observation."]
      ]},
      { concept:"Slice monitoring", prompt:"Aggregate recall rises while recall for one critical machine type falls below its safety floor. What is the decision?", answer:3, options:[
        ["Ignore the small slice.","Criticality, not volume alone, governs."],
        ["Average it with the largest slice.","That hides the failure."],
        ["Delete the slice label.","That destroys evidence."],
        ["Treat the floor breach as a release/operations failure and investigate.","Correct."]
      ]},
      { concept:"Baselines", prompt:"A weekly retail pattern triggers drift every Monday against Sunday. Which baseline improves interpretation?", answer:0, options:[
        ["Comparable weekday/seasonal history plus recent production.","Correct."],
        ["One random training batch only.","It ignores known periodicity."],
        ["No baseline.","Then change cannot be quantified."],
        ["Only CPU from Monday.","That is not an input baseline."]
      ]},
      { concept:"Alert design", prompt:"A tiny category shifts 80% for three requests and wakes on-call nightly. What is missing?", answer:2, options:[
        ["More pages.","That worsens fatigue."],
        ["Automatic full retraining.","Evidence is insufficient."],
        ["Volume, persistence, uncertainty, criticality, and an actionable threshold.","Correct."],
        ["Removal of all category monitoring.","A calibrated signal is better."]
      ]},
      { concept:"Selection bias", prompt:"A challenger is sent only to easy cases and shows higher accuracy. Can it replace the incumbent from this result?", answer:1, options:[
        ["Yes, because the number is higher.","Exposure differs."],
        ["No; compare matched/randomized cohorts or adjust using recorded assignment.","Correct."],
        ["Yes, if latency is low.","Latency does not remove selection."],
        ["No model can ever be compared online.","Controlled comparisons are possible."]
      ]},
      { concept:"Telemetry health", prompt:"All business metrics suddenly become exactly zero across unrelated products. What should responders check immediately alongside containment?", answer:0, options:[
        ["Whether telemetry/aggregation is alive and whether source events stopped.","Correct."],
        ["Whether L2 regularization changed months ago.","Not the immediate shared cause."],
        ["Whether the test set is larger.","Unrelated to production observation."],
        ["Whether every model should be deleted.","Destructive and unjustified."]
      ]}
    ]
  });

})();

(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 37,
    centralQuestion: "How much real traffic should a new model earn before it is trusted with the rest?",
    objective: "Design continuous delivery and deployment with release artifacts, approval gates, environment promotion, progressive traffic, smoke tests, observability, and separation from continuous training.",
    sections: [
      {
        id: "cd",
        title: "Continuous delivery makes a validated artifact releasable on demand",
        body: [
          "Continuous delivery automates the path from a CI-produced candidate to an environment while retaining required approval. Continuous deployment goes further by automatically releasing every change that passes gates. In high-risk AI, delivery may be continuous while production promotion remains a human-authorized decision.",
          "CD consumes a build-once artifact and release manifest. It should not retrain, re-resolve floating dependencies, or rebuild the container. Environment-specific configuration is validated and versioned, secrets are injected through controlled identities, database/schema compatibility is checked, and the previous release remains available.",
          "Smoke tests verify that the service starts, loads the intended model, validates known requests, reports versions, and reaches required dependencies. They do not replace performance, model-quality, or abuse evaluation."
        ],
        table: table("CI, CD, and CT", ["Capability", "Primary action", "Output", "Must not be confused with"], [
          ["CI", "Integrate, test, build", "Validated candidate artifact", "Production authorization"],
          ["CD", "Promote/deploy artifact", "Environment release", "Retraining"],
          ["CT", "Create new model candidate", "New run/version/evidence", "Automatic promotion"],
          ["Progressive delivery", "Increase exposure under observation", "Traffic decision", "Offline validation"]
        ]),
        check: { question: "Why should CD not run training again?", answer: "The newly trained bytes would differ from the candidate CI validated and approved; CD must deploy the immutable artifact with its evidence." }
      },
      {
        id: "progressive",
        title: "Progressive delivery limits blast radius and collects production evidence",
        body: [
          "A deployment can begin with shadow traffic, a canary percentage, an internal cohort, or one region. Traffic grows only when technical and decision guardrails pass. The observation window must cover enough requests and delayed outcomes for the risks under test. Fast error and latency metrics support immediate rollback; business accuracy may need later proxy or matured labels.",
          "A canary needs comparable traffic. If only easy internal users receive the candidate, stable metrics do not establish performance on the general population. Randomized routing or matched cohorts reduce bias, while sticky assignment keeps multi-step user experiences consistent.",
          "Promotion steps should be explicit—1%, 5%, 25%, 50%, 100%—with automatic pause/rollback thresholds and a manual stop control. A rollout that requires an engineer to stare at a dashboard with no criteria is not a gate."
        ],
        example: "A recommendation model canary improves click-through but doubles complaint rate and p99 latency. Clicks are not the sole objective; the release violates business and reliability guardrails. Pause, roll back, and preserve traces before testing a revised candidate.",
        failure: "Increasing traffic before enough independent observations accumulate turns ‘progressive’ into a fast rolling deployment. Define minimum sample, time, and label maturity for each gate.",
        check: { question: "Why use sticky assignment in a conversational assistant canary?", answer: "A user should not alternate model/prompt behavior between turns, which would confound metrics and break state consistency." }
      },
      {
        id: "release-control",
        title: "Release control compares desired and actual state",
        body: [
          "The deployment controller applies the manifest; replicas report loaded image, model, config, and prompt/index versions. Readiness excludes mismatched or unloaded replicas. Traffic control sends only the intended cohort. Observability tags every request by release so candidate and incumbent metrics can be separated.",
          "Approval gates should be tamper-resistant and specific to evidence. A reviewer approves candidate v24 with evaluation digest X, not ‘whatever `latest` points to tomorrow.’ Emergency rollback permission can be broader than forward-promotion permission because restoring a known good version is time-critical.",
          "After full promotion, continue heightened monitoring and retain the old release for a defined window. Close the change with evidence, not when deployment commands return success."
        ],
        code: code("yaml", "release:\n  id: fraud-prod-2026-10-18.1\n  image: registry/service@sha256:a17...\n  model: models:/fraud_risk/24\n  config: config@sha256:5cc...\n  previous: fraud-prod-2026-10-02.1\nrollout:\n  steps: [1, 5, 25, 50, 100]\n  pause_minutes: [15, 30, 60, 120, 0]\n  abort_if:\n    error_rate: \'> 1%\'\n    p99_ms: \'> 700\'\n    alert_volume_ratio: \'> 1.25\'", [
          "Immutable component references define what may be deployed.",
          "The previous release is predeclared.",
          "Traffic and observation steps are explicit.",
          "Technical and decision-volume abort conditions are machine-readable."
        ], "It prevents an unbounded all-at-once release and makes the rollback target and failure criteria available before impact grows."),
        check: { question: "Why tag telemetry with release ID rather than only service name?", answer: "It lets engineers compare candidate and incumbent behavior during overlapping traffic and identify exactly which stack produced an incident." }
      }
    ],
    glossary: [
      ["Continuous delivery", "Automated ability to promote a validated artifact on demand."],
      ["Continuous deployment", "Automatic production release after gates pass."],
      ["Release", "Immutable behavior stack deployed to an environment."],
      ["Promotion", "Controlled advancement of a release or traffic exposure."],
      ["Smoke test", "Fast verification that core deployment functions operate."],
      ["Progressive delivery", "Staged exposure under explicit observation gates."],
      ["Canary", "Small live cohort receiving the candidate release."],
      ["Sticky assignment", "Consistent routing of an entity to one release."],
      ["Blast radius", "Extent of users/resources affected by a failure."],
      ["Abort criterion", "Observable condition that stops or reverses rollout."]
    ],
    exercise: {
      duration: 35,
      title: "Create a progressive release contract",
      brief: "A new claims model passed offline gates; labels mature in 14 days, but latency and queue volume are immediate.",
      parts: [
        "Define release manifest, environment checks, and smoke tests.",
        "Choose canary cohorts and traffic steps with minimum samples/time.",
        "Separate immediate abort signals, leading proxies, and matured quality outcomes.",
        "Write approval, pause, rollback, and full-promotion ownership."
      ],
      solution: "Pin image, model, preprocessing, config, schema, and rollback. Smoke-test version reporting and golden requests. Route a representative sticky randomized cohort, not only easy internal traffic. Abort immediately on errors, p99, saturation, or unsafe decision-volume shifts; pause on proxy regressions; keep a 14-day shadow/canary evidence plan for final outcome quality. A controlled approver authorizes forward steps; on-call may roll back immediately to the predeclared complete release."
    },
    sources: { core: ["mlflowRegistry","kubernetesDeploy"], deep: ["otel","azureWellArchitectedAI"] },
    quiz: [
      { concept:"CD", prompt:"CD fetches source and rebuilds an image with floating dependencies in production. What principle fails?", answer:0, options:[
        ["Build once and promote the identical validated artifact.","Correct."],
        ["Every environment needs different source code.","Logic should remain consistent."],
        ["Models may not use dependencies.","They do, but dependencies need identity."],
        ["Production should retrain automatically.","That is CT and still needs gates."]
      ]},
      { concept:"Continuous deployment", prompt:"What distinguishes continuous deployment from continuous delivery?", answer:2, options:[
        ["Deployment has no tests.","It still depends on gates."],
        ["Delivery always retrains models.","It promotes artifacts."],
        ["Deployment automatically releases passing changes; delivery keeps release on demand.","Correct."],
        ["There is no difference in approval implications.","The automation boundary differs."]
      ]},
      { concept:"Canary", prompt:"A canary receives only expert internal users. Can it establish general-user quality?", answer:1, options:[
        ["Yes, any live traffic is representative.","Cohort selection matters."],
        ["No; the cohort is selected and may be easier or behave differently.","Correct."],
        ["Yes, if it lasts five minutes.","Time does not repair selection bias."],
        ["No, because canaries never use real traffic.","They do by definition."]
      ]},
      { concept:"Guardrails", prompt:"Candidate click-through rises but complaint rate breaches the declared limit. What should rollout do?", answer:3, options:[
        ["Ignore complaints because the primary metric rose.","Guardrails exist to constrain this trade-off."],
        ["Move to 100% for more evidence.","That increases harm."],
        ["Delete the guardrail.","That changes policy after seeing failure."],
        ["Pause or roll back according to the release contract.","Correct."],
      ]},
      { concept:"Observation window", prompt:"A 1% canary serves 20 requests and has zero errors. Is promotion justified?", answer:2, options:[
        ["Always; zero errors proves reliability.","The sample is too small for many risks."],
        ["Never; canaries cannot support decisions.","They can with adequate evidence."],
        ["Only if predefined minimum sample/time and relevant risks are satisfied.","Correct."],
        ["Yes, because 1% is an official universal threshold.","No universal percentage exists."]
      ]},
      { concept:"Actual state", prompt:"Deployment command succeeds, but replica metadata shows mixed model versions. Is release complete?", answer:0, options:[
        ["No; reconcile actual state and exclude mismatched replicas from readiness.","Correct."],
        ["Yes, command success overrides runtime evidence.","Desired state is not actual state."],
        ["Yes, if the alias moved.","Registry state does not prove replica load."],
        ["No, because replicas may never differ temporarily.","Rollouts can be staged; completion still requires declared state."]
      ]},
      { concept:"Approval binding", prompt:"A reviewer approves alias `candidate`, which later moves to another version. What is wrong?", answer:1, options:[
        ["Aliases cannot be used in workflows.","They can, but must resolve to an immutable target."],
        ["Approval was not bound to a specific version and evidence digest.","Correct."],
        ["Reviewers may approve only source code.","They can approve releases with evidence."],
        ["The model must be deleted.","Correct the promotion control instead."]
      ]}
    ]
  });

  register({
    id: 38,
    centralQuestion: "When should production evidence trigger training again—and who decides whether the result deserves release?",
    objective: "Design continuous training with scheduled, drift, performance, and event triggers; handle label maturity, feedback bias, validation, approval, champion–challenger comparison, and post-retraining rollback.",
    sections: [
      {
        id: "triggers",
        title: "A trigger opens an investigation and candidate pipeline",
        body: [
          "Scheduled retraining fits predictable data arrival and stable costs. Drift triggers react when input or score distributions change. Performance triggers use matured labels when quality crosses a floor. Event triggers respond to new products, policy changes, sensor replacements, or enough new labeled cases. Hybrid rules can require both minimum new data and a material signal.",
          "Not every alert should train. A schema defect, unit conversion, missing feed, or adversarial spike must be repaired or quarantined. Retraining on corruption teaches it. Drift can be benign seasonal change that the current model handles; evaluate impact before consuming compute.",
          "Debounce triggers so one incident does not launch dozens of overlapping jobs. Record trigger reason, evidence window, data cutoff, and owner. A run should acquire an orchestration lock or deduplicate by trigger/data version."
        ],
        table: table("Retraining trigger trade-offs", ["Trigger", "Strength", "Blind spot", "Control"], [
          ["Scheduled", "Simple and predictable", "Trains when unnecessary; misses sudden change", "Freshness/minimum-data gate"],
          ["Data drift", "Works before labels", "Drift may not harm performance", "Impact and quality diagnosis"],
          ["Performance", "Direct outcome evidence", "Labels delayed/selected", "Maturity and observation correction"],
          ["Event", "Connects known change", "Human event classification", "Change record and targeted validation"]
        ]),
        check: { question: "Why should a drift trigger not automatically promote a retrained model?", answer: "Drift may be benign or corrupted; the new candidate still needs data, quality, model, safety, and release validation." }
      },
      {
        id: "feedback",
        title: "Feedback is delayed and changed by the model itself",
        body: [
          "Outcome labels often arrive after days or months. Define maturity by event time plus outcome window plus reporting delay. Exclude unresolved recent cases from performance triggers. If the model determines who receives an intervention or review, observed labels are policy-selected: non-alerted cases may never be investigated, and intervention may prevent the predicted event.",
          "Log prediction, model/policy version, exposure, action, reviewer outcome, and final label separately. Exploration samples or randomized audits can reveal outcomes outside the alert set where ethically acceptable. Causal evaluation may be needed when interventions change outcomes.",
          "Training data should not blindly append all feedback. Reviewer decisions can encode automation bias, and false alerts may receive richer labels. Curate label provenance, disagreement, and sampling weights."
        ],
        example: "A maintenance model triggers repairs that prevent failures. Retraining labels repaired machines as ‘no failure,’ teaching the model that high-risk patterns are safe. Record the intervention and use a counterfactual or carefully defined target; otherwise successful prevention poisons feedback.",
        failure: "Using yesterday’s incomplete labels as a performance trigger creates an apparent recall collapse or improvement driven by reporting delay, not model behavior.",
        check: { question: "How can a successful intervention make naïve labels misleading?", answer: "The model causes an action that changes the outcome, so observed non-events do not show what would have happened without intervention." }
      },
      {
        id: "candidate-flow",
        title: "Continuous training produces challengers, not automatic champions",
        body: [
          "A CT pipeline validates data, materializes point-in-time features, trains tracked runs, evaluates across time/slices, registers a candidate, and stops at the promotion boundary unless policy authorizes more. Compare with the current champion on a common holdout and replay recent production traffic.",
          "A retrained model can regress because new data is smaller, labels shifted, class prevalence changed, or hyperparameters are stale. Include calibration and threshold re-selection; a new probability distribution under an old threshold can overwhelm operations.",
          "Deploy progressively and preserve the old complete release. After rollback, quarantine the challenger, trace its training data and trigger, and refine the CT rule. Monitor retraining pipeline reliability itself: trigger count, queue time, run failure rate, candidate pass rate, compute cost, and time to approved release."
        ],
        code: code("python", "def on_retraining_signal(signal):\n    if not signal.data_quality_passed or not signal.labels_mature:\n        return record_no_train(signal, reason=\"invalid_or_immature_evidence\")\n    key = f\"{signal.type}:{signal.data_snapshot}\"\n    with orchestration_lock(key):\n        run = train_candidate(snapshot=signal.data_snapshot, trigger=signal.id)\n        report = compare_to_champion(run, common_holdout=signal.holdout)\n        if report.passes_all_gates:\n            return register_candidate(run, report)\n        return quarantine(run, report.failed_gates)", [
          "Quality and label maturity are checked before compute.",
          "A deterministic key deduplicates overlapping triggers.",
          "Champion comparison uses a common holdout.",
          "Passing creates a candidate only; deployment remains separate."
        ], "It prevents corrupted/immature feedback, duplicate training storms, incomparable evaluation, and automatic overwrite of production."),
        check: { question: "Why might threshold selection need to be repeated after retraining?", answer: "The score and calibration distributions can change even if ranking improves, so the old threshold may produce different error rates and workload." }
      }
    ],
    glossary: [
      ["Continuous training", "Automated creation and validation of new model candidates from triggers."],
      ["Scheduled retraining", "Training initiated at fixed time intervals."],
      ["Drift trigger", "Training signal based on material distribution change."],
      ["Performance trigger", "Training signal based on matured outcome degradation."],
      ["Event trigger", "Training signal caused by a known business or system change."],
      ["Debounce", "Suppressing repeated triggers caused by one condition."],
      ["Champion", "Current reference or production model."],
      ["Challenger", "New candidate evaluated against the champion."],
      ["Feedback bias", "Distortion because model decisions affect which outcomes are observed."],
      ["Automation bias", "Human tendency to over-rely on automated recommendations."],
      ["Orchestration lock", "Control preventing duplicate concurrent pipeline work."]
    ],
    exercise: {
      duration: 35,
      title: "Design CT for delayed fraud labels",
      brief: "Labels mature after 45 days; investigators examine mostly alerts; seasonal drift appears monthly; one upstream outage caused missing income.",
      parts: [
        "Define scheduled, drift, performance, and event signals with debounce/minimum-data rules.",
        "Separate data incidents from legitimate triggers.",
        "Design label maturity and exploration/audit sampling for feedback.",
        "Specify champion comparison, calibration/threshold gates, promotion, and rollback."
      ],
      solution: "Use a monthly schedule only when enough new mature labels exist; drift opens diagnosis, not automatic training. The income outage is quarantined and repaired. Track label eligibility by prediction date plus 45 days and maintain an ethically approved random audit outside alerts to estimate missed fraud. Train point-in-time candidates, compare to champion on one common recent mature holdout, recalibrate and select threshold under capacity, register only on all gates, then canary. Preserve champion release for rollback."
    },
    sources: { core: ["mlflowTracking","mlflowRegistry"], deep: ["googleOverfit","otel"] },
    quiz: [
      { concept:"Scheduled retraining", prompt:"A weekly retrain runs even when no new labels exist. What control would avoid waste and instability?", answer:2, options:[
        ["Always promote the identical output.","Promotion is still unnecessary and risky."],
        ["Delete the schedule.","Schedules can remain useful with gates."],
        ["Require minimum new mature evidence before training.","Correct."],
        ["Use the test set as new training labels.","That contaminates evaluation."]
      ]},
      { concept:"Drift trigger", prompt:"A feature distribution changes, but champion performance on mature labels is stable. What should happen first?", answer:0, options:[
        ["Diagnose the shift and its impact before deciding to retrain.","Correct."],
        ["Overwrite production immediately.","Drift alone does not prove harm."],
        ["Disable monitoring.","That removes evidence."],
        ["Assume concept drift with certainty.","Input drift and concept drift differ."]
      ]},
      { concept:"Label maturity", prompt:"Default labels need 90 days, but a performance trigger includes loans issued 10 days ago as non-default. What bias appears?", answer:1, options:[
        ["All recent cases are true negatives.","Their outcomes are unresolved."],
        ["Right-censored cases are mislabeled, distorting recent performance.","Correct."],
        ["The model becomes unsupervised.","Labels exist but are immature."],
        ["The GPU sees too many tokens.","This is an outcome-time issue."]
      ]},
      { concept:"Intervention feedback", prompt:"Repairs triggered by high risk prevent machine failure. Why not label every repaired case ‘safe’ for retraining?", answer:3, options:[
        ["Repairs delete sensor features.","Not necessarily."],
        ["Safe labels are always MNAR.","The causal intervention is the key."],
        ["The old model must be perfect.","No such claim follows."],
        ["The intervention changed the outcome, so no-failure does not reveal untreated risk.","Correct."],
      ]},
      { concept:"Trigger deduplication", prompt:"Ten drift monitors fire on the same snapshot and launch ten identical jobs. Which control is missing?", answer:0, options:[
        ["A trigger/snapshot idempotency key or orchestration lock.","Correct."],
        ["A higher classification threshold.","Decision thresholds do not coordinate pipelines."],
        ["A larger test set only.","That does not prevent duplicate jobs."],
        ["An unbounded GPU queue.","That worsens waste."]
      ]},
      { concept:"Champion comparison", prompt:"A challenger is evaluated on a newer, easier set than the champion’s report. Can scores be compared directly?", answer:2, options:[
        ["Yes, newer always means better evidence.","Population difficulty differs."],
        ["Yes, if metric names match.","Set and protocol matter."],
        ["No; score both on a common appropriate holdout.","Correct."],
        ["No, challengers can never replace champions.","They can after credible comparison and release gates."]
      ]},
      { concept:"Post-retraining threshold", prompt:"A retrained model is better calibrated but produces generally higher probabilities. What operational check is essential?", answer:1, options:[
        ["Keep the old threshold without measuring anything.","Alert volume and errors can shift."],
        ["Re-select/validate the threshold against costs and capacity.","Correct."],
        ["Remove probability outputs.","They can remain useful."],
        ["Promote based on training loss only.","Training loss is not operational evidence."]
      ]}
    ]
  });

  register({
    id: 39,
    centralQuestion: "Does a Docker image reproduce the model service—or merely package files that still depend on a changing world?",
    objective: "Build and reason about Docker images, containers, Dockerfiles, layers, registries, cache behavior, multi-stage/security practices, runtime configuration, model packaging, and immutable release digests.",
    sections: [
      {
        id: "image-container",
        title: "The image is a package; the container is a process",
        body: [
          "A container image is a standardized immutable package of filesystem layers, metadata, runtime, libraries, and application files. A container is a running isolated process created from an image with runtime configuration, networks, mounts, and resource limits. Stopping a container does not alter the image; writing inside a container’s writable layer is ephemeral unless persisted externally.",
          "A registry stores and distributes images. Tags such as `v1` or `latest` are mutable references; a digest identifies content. Releases should resolve tags to reviewed digests so the same manifest pulls the same bytes. Registry access, signatures, vulnerability scanning, retention, and promotion policy are part of the supply chain.",
          "Containers share the host kernel and provide process isolation, not a full virtual machine boundary. Run untrusted models or code only under appropriate sandboxing and policy; containerization alone is not permission."
        ],
        diagram: diagram("flow", "Docker build and run flow", ["Dockerfile + context", "Image layers", "Registry digest", "Container process", "Runtime model/config"], [[0,1],[1,2],[2,3],[4,3]], "Build-time content is immutable; secrets and environment-specific settings enter at runtime."),
        check: { question: "Why should a release pin an image digest rather than `latest`?", answer: "A digest identifies immutable bytes; a tag can move and make identical deployment configuration pull different content." }
      },
      {
        id: "layers",
        title: "Dockerfile order controls caching, size, and exposure",
        body: [
          "Each relevant Dockerfile instruction creates or contributes to a layer. Layers are content-addressed and reusable. Put slowly changing dependency manifests before frequently changing source so dependency installation can be cached. Combine cleanup with package installation in the same layer; deleting files in a later layer does not remove them from earlier layer history.",
          "The build context is sent to the builder. Use `.dockerignore` to exclude datasets, credentials, notebooks, caches, and Git history. `COPY . .` without review can embed secrets and huge files. Build arguments and environment instructions are not safe secret channels because layer metadata and build logs may retain values.",
          "Multi-stage builds compile or download in a builder stage and copy only runtime outputs into a smaller final stage. This reduces attack surface and size. A smaller image still needs patched dependencies and an SBOM; minimalism is not proof of safety."
        ],
        table: table("Dockerfile decision effects", ["Decision", "Benefit", "Failure mode"], [
          ["Pin base digest", "Immutable base bytes", "Missed security updates without review cadence"],
          ["Copy lock before source", "Reusable dependency cache", "Stale cache if lock incomplete"],
          ["Multi-stage", "Smaller runtime image", "Needed runtime library omitted"],
          ["Non-root user", "Limits process privilege", "Filesystem permissions misconfigured"],
          ["`.dockerignore`", "Keeps secrets/data out of context", "Over-broad pattern omits required files"]
        ]),
        failure: "Deleting an API key in a later Dockerfile line does not erase it from the earlier layer. Assume any secret present during ordinary build steps may be recoverable; use supported secret mounts and never copy it into final layers.",
        check: { question: "Why copy the dependency lock before source code?", answer: "Source changes then invalidate only later layers; the expensive dependency layer remains cached when the lock is unchanged." }
      },
      {
        id: "ml-packaging",
        title: "Model packaging chooses release coupling",
        body: [
          "Baking a model into the image produces one atomic digest for code and weights and fast deterministic startup, but images become large and every model promotion rebuilds the package. Loading an immutable model from a registry at startup decouples code and model releases and reduces image churn, but readiness depends on network/storage and the manifest must bind the model digest.",
          "Whichever pattern is used, load once, verify artifact signature/checksum and schema, run a golden inference, then become ready. Store caches in controlled mounts if needed, but never let a mutable cache silently choose a different model. Set CPU/memory limits and handle termination signals so requests drain.",
          "Use a non-root user, read-only root filesystem where possible, no package manager in runtime, and narrowly exposed ports. Health checks should verify process and model readiness separately."
        ],
        code: code("dockerfile", "FROM python:3.12-slim@sha256:<approved-digest> AS runtime\nWORKDIR /app\nCOPY requirements.lock ./\nRUN pip install --no-cache-dir --require-hashes -r requirements.lock\nCOPY src/ ./src/\nCOPY model-manifest.json ./model-manifest.json\nRUN useradd --uid 10001 --create-home modeluser && chown -R 10001:10001 /app\nUSER 10001\nEXPOSE 8080\nCMD [\"python\", \"-m\", \"src.server\", \"--manifest\", \"model-manifest.json\"]", [
          "Base and dependencies are immutable inputs.",
          "The model manifest—not an unversioned download URL—binds expected artifact identity.",
          "The runtime process has no root privilege.",
          "Startup code must verify and load the manifest before readiness."
        ], "It prevents floating runtime dependencies, root-by-default execution, and a container that reports ready before the intended model is verified."),
        check: { question: "What is the main trade-off of baking weights into the image?", answer: "Atomic, fast startup versus large images and tight coupling of model and application release cycles." }
      }
    ],
    glossary: [
      ["Docker image", "Immutable layered package for a containerized process."],
      ["Container", "Running isolated process instantiated from an image."],
      ["Dockerfile", "Declarative instructions used to build an image."],
      ["Layer", "Content-addressed filesystem/change unit reused across images."],
      ["Registry", "Service storing and distributing images."],
      ["Tag", "Mutable human-readable image reference."],
      ["Digest", "Immutable content address for image bytes."],
      ["Build context", "Files made available to a Docker build."],
      ["Multi-stage build", "Build using intermediate stages and a minimal final runtime stage."],
      ["Writable layer", "Ephemeral container-specific filesystem changes."],
      ["Non-root", "Process identity without root privileges inside the container."]
    ],
    exercise: {
      duration: 35,
      title: "Harden and optimize a model-service image",
      brief: "The current image is 9 GB, uses `latest`, copies the repository including data and `.env`, runs as root, and downloads `model/latest.pkl` per request.",
      parts: [
        "Rewrite build context and layer order with a locked dependency file.",
        "Choose baked or startup-fetched immutable model packaging and defend it.",
        "Add non-root, read-only-compatible paths, health/readiness, and graceful termination requirements.",
        "Define registry scanning, digest, provenance, and secret-rotation workflow."
      ],
      solution: "Exclude data, `.env`, Git, notebooks, and caches. Pin the base digest, install hash-locked dependencies before copying source, and use a minimal runtime stage. For independently promoted large weights, fetch a manifest-pinned signed artifact once at startup, verify schema/digest and a golden prediction, then mark ready; cache only by immutable ID. Run as non-root, write only to explicit temporary/cache volumes, drain on SIGTERM, scan and attest the image, deploy by digest, and inject rotating credentials at runtime."
    },
    sources: { core: ["dockerImages","dockerfile"], deep: ["kubernetesProbes"] },
    quiz: [
      { concept:"Image vs container", prompt:"An application writes a file inside a running container. Does the base image change?", answer:1, options:[
        ["Yes, every runtime write mutates the registry image.","The container gets a writable layer."],
        ["No; the write belongs to container state unless explicitly committed/persisted.","Correct."],
        ["Yes, if the file is small.","Size is irrelevant."],
        ["No, because containers cannot write files.","They can unless filesystem policy prevents it."]
      ]},
      { concept:"Digests", prompt:"A tag `prod` now points to different bytes. Which identifier supports immutable rollback?", answer:0, options:[
        ["The previously recorded image digest.","Correct."],
        ["The current `prod` tag only.","It moved."],
        ["The developer’s container name.","Runtime names do not identify image content."],
        ["The exposed port.","Ports are configuration."]
      ]},
      { concept:"Layers", prompt:"A secret is copied in layer 2 and deleted in layer 5. Is it gone from image history?", answer:3, options:[
        ["Yes, deletion rewrites earlier immutable layers.","It adds a later deletion marker."],
        ["Yes, if the container runs as non-root.","Privilege does not erase build history."],
        ["Only if the secret is text.","Type is irrelevant."],
        ["No; it may remain recoverable from the earlier layer.","Correct."],
      ]},
      { concept:"Build cache", prompt:"Why install locked dependencies before copying frequently changing source?", answer:2, options:[
        ["To expose dependencies publicly.","No; dependency installation order concerns cache reuse, not public exposure."],
        ["To force reinstall on every edit.","The opposite."],
        ["To reuse the dependency layer while its manifest stays unchanged.","Correct."],
        ["To make tags immutable.","Layer order does not freeze tags."]
      ]},
      { concept:"Build context", prompt:"`COPY . .` includes a 20 GB dataset and `.env`. What is the first control?", answer:1, options:[
        ["Add the API key to another file.","That multiplies exposure."],
        ["Use a reviewed `.dockerignore` and explicit `COPY` paths.","Correct."],
        ["Run as root so files copy faster.","That increases privilege."],
        ["Rename the dataset to model.","Names do not reduce context."]
      ]},
      { concept:"Model loading", prompt:"The service downloads `latest.pkl` on every request. What is the best redesign?", answer:0, options:[
        ["Load one trusted immutable artifact at startup, verify it, and expose readiness.","Correct."],
        ["Increase request timeout indefinitely.","That hides waste and inconsistency."],
        ["Allow each request to choose any public artifact.","That destroys trust and repeatability."],
        ["Return 200 before the download.","That reports success without prediction."]
      ]},
      { concept:"Container limits", prompt:"Why does containerization not reproduce an external model API exactly?", answer:2, options:[
        ["Containers cannot make network calls.","They can under policy."],
        ["Images have no files.","They package files."],
        ["The remote service/model can change outside the image boundary.","Correct. Pin/provider-contract and monitor external behavior."],
        ["Docker always retrains models.","It does not."]
      ]}
    ]
  });

  register({
    id: 40,
    centralQuestion: "A Pod restarted successfully. Did Kubernetes restore the model service, or only restart a broken process?",
    objective: "Explain Pods, Deployments, Services, ConfigMaps, Secrets, requests, limits, desired-state reconciliation, probes, and failure recovery for a containerized model service.",
    sections: [
      {
        id: "objects",
        title: "Kubernetes reconciles declared objects into running workloads",
        body: [
          "A Pod is the smallest scheduled unit and contains one or more tightly coupled containers sharing network and volumes. Pods are disposable. A Deployment declares a desired replica count and Pod template, creates ReplicaSets, performs rolling updates, and replaces failed Pods. A Service provides a stable virtual endpoint and load-balances to selected ready Pods even as Pod addresses change.",
          "Worker nodes run Pods; the control plane stores desired state, schedules work, and runs controllers that reconcile differences. If a Pod dies, a controller creates another. Kubernetes does not know whether a restarted model is accurate, compatible, or permitted; your readiness and validation logic must express what healthy means.",
          "ConfigMaps supply non-secret configuration; Secrets are Kubernetes objects for sensitive values but still require encryption/access controls and careful mounting. Neither should contain mutable model logic without versioned release identity."
        ],
        diagram: diagram("kubernetes", "Kubernetes model-serving path", ["Control plane", "Deployment / ReplicaSet", "Pods on worker nodes", "Service", "Client traffic"], [[0,1],[1,2],[2,3],[3,4]], "Controllers restore replica count; Services route only to endpoints considered ready."),
        check: { question: "Why should clients use a Service instead of Pod IPs?", answer: "Pod addresses are ephemeral; the Service supplies stable discovery and routes across the current ready replica set." }
      },
      {
        id: "resources",
        title: "Requests schedule capacity; limits constrain consumption",
        body: [
          "A CPU or memory request tells the scheduler what a Pod needs and contributes to placement. A limit caps resource use. CPU excess is throttled; exceeding a memory limit commonly leads to OOM termination. Understated requests pack too many services on a node and cause contention; overstated requests waste schedulable capacity and can leave Pods pending.",
          "GPU resources are typically scheduled as discrete devices through plugins. One replica may reserve an entire GPU even when utilization is low unless partitioning/sharing is configured. Model memory, KV cache, batch size, and concurrency must fit the requested resource profile.",
          "Resource behavior affects SLOs. CPU throttling can inflate tail latency without process failure. OOM restarts can look like automatic recovery while requests fail repeatedly. Monitor throttling, working set, restarts, pending Pods, and accelerator utilization."
        ],
        table: table("Kubernetes resource controls", ["Control", "Used by", "Too low", "Too high"], [
          ["CPU request", "Scheduler/share", "Contention and throttling risk", "Wasted placement capacity"],
          ["CPU limit", "Runtime throttling", "Tail latency", "Weak isolation"],
          ["Memory request", "Scheduler", "Node pressure", "Unschedulable/waste"],
          ["Memory limit", "Runtime/OOM enforcement", "Restart loop", "Weak isolation"],
          ["Replica count", "Deployment", "Queue/latency", "Cost and low utilization"]
        ]),
        failure: "Setting memory request low and limit high can overcommit a node; several model replicas may all grow toward their limits and trigger node pressure. Requests must reflect realistic steady and peak working sets.",
        check: { question: "What is the usual difference between CPU and memory limit breaches?", answer: "CPU is throttled, increasing latency; memory excess generally terminates the container with OOM." }
      },
      {
        id: "probes",
        title: "Liveness restarts; readiness protects traffic; startup buys initialization time",
        body: [
          "A liveness probe asks whether the process is irrecoverably stuck and should restart. A readiness probe asks whether it can currently serve traffic; failure removes it from Service endpoints without necessarily restarting. A startup probe protects slow initialization by delaying liveness/readiness evaluation until loading completes.",
          "For model serving, readiness should remain false until the intended artifact, preprocessing, and critical dependencies pass checks. Liveness should be shallow enough that a temporary external dependency outage does not restart every Pod. Probes themselves consume resources; aggressive timeouts can cause cascading restarts during load.",
          "Graceful termination marks the Pod unready, stops new traffic, drains in-flight work, flushes safe telemetry, and exits before the grace period. Without it, rolling updates and scale-down drop requests."
        ],
        code: code("yaml", "resources:\n  requests: { cpu: \"1\", memory: \"4Gi\" }\n  limits:   { cpu: \"2\", memory: \"6Gi\" }\nstartupProbe:\n  httpGet: { path: /startup, port: 8080 }\n  failureThreshold: 30\n  periodSeconds: 10\nreadinessProbe:\n  httpGet: { path: /ready, port: 8080 }\n  periodSeconds: 5\nlivenessProbe:\n  httpGet: { path: /live, port: 8080 }\n  periodSeconds: 10", [
          "The startup budget allows up to five minutes for verified model loading.",
          "Readiness can remove a temporarily overloaded/unprepared Pod from traffic.",
          "Liveness checks process health separately from model readiness.",
          "Requests and limits express scheduling and enforcement assumptions."
        ], "It prevents slow model load from triggering a restart loop and prevents traffic from reaching a process before its artifact is ready."),
        check: { question: "Why should a database outage usually fail readiness but not liveness?", answer: "The Pod may be temporarily unable to serve but is not internally dead; restarting every replica adds churn without fixing the dependency." }
      }
    ],
    glossary: [
      ["Pod", "Smallest Kubernetes scheduling unit containing one or more containers."],
      ["Deployment", "Controller declaring and rolling out a replicated stateless Pod template."],
      ["ReplicaSet", "Controller maintaining a desired count of matching Pods."],
      ["Service", "Stable discovery and routing abstraction over selected Pods."],
      ["Control plane", "Components storing desired state and coordinating the cluster."],
      ["Worker node", "Machine running scheduled Pods."],
      ["ConfigMap", "Kubernetes object for non-secret configuration."],
      ["Secret", "Kubernetes object for sensitive configuration requiring access/encryption controls."],
      ["Resource request", "Scheduled capacity declaration."],
      ["Resource limit", "Runtime consumption cap."],
      ["Liveness probe", "Restart decision signal."],
      ["Readiness probe", "Traffic eligibility signal."],
      ["Startup probe", "Initialization completion signal shielding slow starts."]
    ],
    exercise: {
      duration: 35,
      title: "Stop a model-serving restart storm",
      brief: "Model load takes 140 seconds; liveness starts at 30 seconds, Pods restart repeatedly, and a database outage also restarts all replicas.",
      parts: [
        "Design startup, readiness, and liveness semantics and timings.",
        "Set initial CPU/memory requests and limits from measured profiles.",
        "Define Service selectors and release/version telemetry.",
        "Write graceful startup, update, scale-down, and dependency-outage behavior."
      ],
      solution: "Add a startup probe whose total failure budget exceeds worst verified load time; liveness checks only internal event-loop/process health after startup. Readiness requires correct model load and serving dependencies and fails during database outage without restart. Size requests near realistic steady working set with peak headroom under limits and observe CPU throttling/OOM. Service routes only ready Pods. On termination, mark unready and drain. Tag telemetry and readiness with release/model versions so mixed rollouts are visible."
    },
    sources: { core: ["kubernetesBasics","kubernetesPods","kubernetesDeploy","kubernetesService","kubernetesProbes"], deep: ["dockerImages"] },
    quiz: [
      { concept:"Pods", prompt:"A Pod IP changes after restart. What should clients depend on?", answer:2, options:[
        ["The old Pod IP forever.","Pods are disposable."],
        ["The container writable layer.","It is not service discovery."],
        ["A Kubernetes Service selecting ready Pods.","Correct."],
        ["A model registry alias as network routing.","Registry state does not route HTTP."]
      ]},
      { concept:"Deployment", prompt:"A node fails and two model Pods disappear. Which controller restores desired replicas?", answer:1, options:[
        ["ConfigMap","It stores configuration."],
        ["Deployment through its ReplicaSet","Correct."],
        ["Service only","It routes but does not create Pods."],
        ["Dockerfile","It builds images."]
      ]},
      { concept:"CPU limit", prompt:"A container reaches its CPU limit under load but stays alive. What symptom is likely?", answer:0, options:[
        ["Throttling and higher tail latency.","Correct."],
        ["Automatic model retraining.","Resource enforcement does not train."],
        ["Memory immediately doubles.","CPU limit is separate."],
        ["Every request becomes unauthorized.","Permissions are unchanged."]
      ]},
      { concept:"Memory limit", prompt:"A model process exceeds its memory limit. What is a common outcome?", answer:3, options:[
        ["Only slower clock speed.","Memory excess is not CPU throttling."],
        ["The scheduler increases the limit automatically.","Limits do not self-expand."],
        ["The model compresses itself.","No automatic compression occurs."],
        ["OOM termination and a possible restart loop.","Correct."],
      ]},
      { concept:"Readiness", prompt:"A Pod is running but its required model checksum fails. Which probe should keep it out of traffic?", answer:1, options:[
        ["Liveness only, forcing endless restarts without diagnosis.","Restart may repeat the same bad artifact."],
        ["Readiness, with startup failing deployment if artifact cannot validate.","Correct."],
        ["No probe; return random scores.","Unsafe."],
        ["A ConfigMap label.","It does not route traffic by health alone."]
      ]},
      { concept:"Liveness", prompt:"An external database is temporarily unavailable, but the process is healthy. Should liveness fail?", answer:2, options:[
        ["Yes, restart every Pod together.","That adds churn and load."],
        ["Yes, liveness must test every dependency.","It should test internal recoverability."],
        ["Usually no; fail readiness and recover when the dependency returns.","Correct."],
        ["No, and readiness must remain true.","The service may not be able to serve."]
      ]},
      { concept:"Startup probe", prompt:"Why add a startup probe for a 3-minute model load?", answer:0, options:[
        ["It delays liveness enforcement until initialization has a fair budget.","Correct."],
        ["It permanently disables readiness.","Readiness begins after startup."],
        ["It increases model accuracy.","Probes affect lifecycle, not weights."],
        ["It stores secrets.","Secrets are separate objects."]
      ]}
    ]
  });

  register({
    id: 41,
    centralQuestion: "Must this prediction exist in milliseconds, after the nightly load, or continuously as events arrive?",
    objective: "Choose batch, online, streaming, and latency-sensitive inference; define freshness, consistency, feature availability, cost, and failure behavior for each.",
    sections: [
      {
        id: "modes",
        title: "Inference mode is a product-time contract",
        body: [
          "Batch inference scores a bounded dataset on a schedule or job trigger and writes results for later use. It maximizes throughput with large batches and relaxed latency. Online inference serves individual or small requests when a decision is needed immediately. Streaming inference processes a continuing event flow, maintains windows or state, and emits predictions as events arrive.",
          "The categories can combine. A streaming feature pipeline may update an online store used by a synchronous endpoint; a nightly batch may precompute embeddings while online retrieval serves them. The critical distinction is when the prediction and its features must be fresh enough for the decision.",
          "Latency-sensitive inference has an end-to-end deadline including network, validation, feature fetch, queueing, model compute, postprocessing, and action. A 20 ms model is not a 20 ms service if feature lookup takes 150 ms."
        ],
        table: table("Inference modes", ["Mode", "Trigger", "Primary objective", "Characteristic risk"], [
          ["Batch", "Schedule/job/data arrival", "Throughput and cost", "Stale results and partial reruns"],
          ["Online", "Request", "Low per-request latency", "Tail latency and saturation"],
          ["Streaming", "Continuous event", "Fresh incremental response", "Ordering, state, replay"],
          ["Precomputed online", "Batch refresh + request lookup", "Fast serving", "Freshness mismatch"]
        ]),
        check: { question: "Why can a system use batch and online inference together?", answer: "Batch can precompute expensive stable components or scores, while online logic retrieves or adjusts them at request time." }
      },
      {
        id: "features",
        title: "Feature time and serving mode must agree",
        body: [
          "Batch features are usually complete through a cutoff. Online features need low-latency stores and freshness guarantees. Streaming features require event-time windows, late-event policy, checkpointed state, and replay. Training must reconstruct the same point-in-time definitions; otherwise training-serving skew appears.",
          "A feature may be fresh but inconsistent. If account balance and recent transactions are read from different update moments, the vector represents no real state. Snapshot/transaction semantics, versioned reads, or tolerance rules may be required. For low-risk cases, slightly stale cached features can be a valid degradation; for authorization or safety decisions, stale data may be unacceptable.",
          "Record feature timestamps and source versions with predictions. Monitoring freshness percentiles and fallback use is as important as model latency."
        ],
        example: "A fraud endpoint returns in 50 ms by using a balance cache that is six hours old. Latency SLO passes, but recent account drain is invisible. The architecture optimized the wrong objective; define a maximum balance age and abstain or route to a slower authoritative lookup when exceeded.",
        failure: "Copying batch transformation code into an online service does not guarantee parity. Different libraries, defaults, time cutoffs, and reference data can create the same feature name with different values.",
        check: { question: "What metadata can reveal stale-feature decisions?", answer: "Per-feature or feature-set event/availability timestamp, source version, retrieval time, and fallback/cache indicator attached to the prediction trace." }
      },
      {
        id: "operational-design",
        title: "Failure handling follows prediction shelf life",
        body: [
          "A failed batch can resume from partitions if outputs are idempotent and versioned. It should not mix partial scores from different model versions under one result snapshot. Online failures need immediate fallback, abstention, or error within the request deadline. Streaming failures require checkpoint recovery and replay without duplicate effects.",
          "Batch optimizes cost per item and completion time; online optimizes latency distribution, concurrency, and availability; streaming adds event lag, watermark, state size, and replay correctness. All modes still need model/data/business monitoring.",
          "Select the simplest mode meeting value timing. If a churn intervention is sent weekly, millisecond online inference adds infrastructure without decision benefit. If fraud authorization occurs at checkout, nightly batch scores may be dangerously stale."
        ],
        code: code("python", "def score_partition(rows, release_id, partition_id):\n    output_key = f\"scores/{release_id}/{partition_id}.parquet\"\n    if object_store.exists(output_key):\n        return output_key\n    validated = contract.validate_batch(rows)\n    scores = model.predict_proba(features.transform(validated))[:, 1]\n    result = attach_lineage(validated.ids, scores, release_id)\n    object_store.put_atomic(output_key, result)\n    return output_key", [
          "Output identity contains release and partition, enabling safe resume.",
          "Input validation precedes transformation.",
          "Every result row carries release lineage.",
          "Atomic write prevents readers from seeing a partial file."
        ], "It prevents duplicate batch work and mixed-version or partially written score datasets during restart."),
        check: { question: "When is online inference unnecessary even if technically possible?", answer: "When the downstream decision acts on a slower cadence and fresher per-request scores create no material value relative to batch cost/complexity." }
      }
    ],
    glossary: [
      ["Batch inference", "Scoring a bounded collection asynchronously for later consumption."],
      ["Online inference", "Request-driven prediction with an immediate response."],
      ["Streaming inference", "Continuous event-driven prediction with incremental state."],
      ["Latency-sensitive", "Work whose value or correctness depends on a tight response deadline."],
      ["Feature freshness", "Age of information relative to the prediction decision."],
      ["Event time", "When an event occurred in the source domain."],
      ["Watermark", "Estimate that most events up to a time have arrived."],
      ["Checkpoint", "Persisted stream-processing state for recovery."],
      ["Replay", "Reprocessing retained events after recovery or logic change."],
      ["Prediction shelf life", "How long a computed prediction remains useful and valid."]
    ],
    exercise: {
      duration: 35,
      title: "Assign inference modes to four workflows",
      brief: "Workflows: weekly churn outreach, checkout fraud, factory sensor alarms, and document embeddings for search.",
      parts: [
        "Choose batch, online, streaming, or a hybrid for each.",
        "Define prediction deadline, feature freshness, and consistency requirement.",
        "Specify failure/retry/replay behavior and result identity.",
        "Name the primary performance and correctness metrics for each mode."
      ],
      solution: "Weekly churn is batch; checkout fraud is online with streaming/online features; sensor alarms are streaming with bounded event-time state; embeddings are batch on document change with online retrieval. Define freshness from decision risk. Batch resumes idempotent partitions; online returns/falls back within deadline; streams checkpoint and replay by event ID. Measure batch completion/cost, online p95/p99/availability, stream lag/late events/duplicates, plus feature age, model quality, and downstream outcomes for all."
    },
    sources: { core: ["azureWellArchitectedAI","kubernetesBasics"], deep: ["otel"] },
    quiz: [
      { concept:"Batch inference", prompt:"A weekly marketing list is finalized every Friday. What is the simplest suitable scoring mode?", answer:0, options:[
        ["Versioned batch inference before list creation.","Correct. Millisecond serving adds little decision value."],
        ["One GPU request per browser keystroke.","The decision does not require it."],
        ["Bidirectional future streaming.","Future data is unavailable."],
        ["No model version in outputs.","Batch results need lineage."]
      ]},
      { concept:"Online inference", prompt:"A card transaction needs an approve/review decision in 200 ms. Which mode leads?", answer:2, options:[
        ["Monthly batch only.","Scores would be stale."],
        ["A two-hour asynchronous job.","The decision expires."],
        ["Online inference with a complete end-to-end latency budget.","Correct."],
        ["Offline report generation.","It cannot respond at checkout."]
      ]},
      { concept:"Streaming", prompt:"Sensor events arrive continuously and a rolling 10-minute pattern triggers an alarm. What extra concern appears?", answer:1, options:[
        ["Only HTML status codes.","The core issue is temporal state."],
        ["Event ordering, late data, window state, checkpoint, and replay.","Correct."],
        ["Every event must train a new model.","Inference and training are separate."],
        ["No lineage is needed.","Stream/release identity is essential."]
      ]},
      { concept:"End-to-end latency", prompt:"Model compute is 15 ms, feature lookup 140 ms, and network 30 ms. Is this a 15 ms service?", answer:3, options:[
        ["Yes, only model time counts.","Users experience the whole path."],
        ["Yes, if average compute is low.","Feature and network dominate."],
        ["No, because all services must exceed one second.","No such rule exists."],
        ["No; end-to-end latency is at least the composed path plus queueing/overhead.","Correct."],
      ]},
      { concept:"Freshness", prompt:"A low-latency fraud service uses a six-hour-old balance with no flag. What is the main failure?", answer:0, options:[
        ["The service meets speed while violating feature freshness semantics.","Correct."],
        ["The model is necessarily underfit.","No training evidence is given."],
        ["Streaming can never use caches.","It can with explicit freshness policy."],
        ["The API must return 201.","Status is not the issue."]
      ]},
      { concept:"Batch resume", prompt:"A batch crashes halfway. How should restart avoid mixed and duplicate results?", answer:2, options:[
        ["Append under one unversioned filename.","That can mix releases and duplicates."],
        ["Delete all lineage.","That removes auditability."],
        ["Use idempotent partition outputs keyed by immutable release and atomic writes.","Correct."],
        ["Randomly skip half the rows.","That loses coverage."]
      ]},
      { concept:"Training-serving skew", prompt:"Batch and online feature code use different category maps. What risk follows?", answer:1, options:[
        ["The model receives identical semantic vectors by definition.","Maps may assign different meanings."],
        ["Offline validation no longer represents the online input transformation.","Correct."],
        ["The network becomes bidirectional.","Feature mapping does not alter sequence direction."],
        ["Latency automatically improves.","No such guarantee."]
      ]}
    ]
  });

  register({
    id: 42,
    centralQuestion: "A model file is loaded and the port is open. What else must be true before the service is ready for real traffic?",
    objective: "Design a production model server covering artifact load, API, replicas, routing, batching, warmup, concurrency, autoscaling signals, health, graceful shutdown, schema validation, and SLO-driven capacity.",
    sections: [
      {
        id: "server-path",
        title: "A model server turns a release artifact into a bounded execution path",
        body: [
          "The request path authenticates and authorizes, validates the contract, constructs or retrieves features, queues work, batches when appropriate, runs inference, postprocesses scores, applies versioned policy, and serializes a response. Each step consumes deadline and can fail. The inference server may be embedded in the API or separated behind a protocol optimized for tensors and batching.",
          "Load the exact model/preprocessing bundle once per replica. Verify digest, signature/provenance, runtime compatibility, feature schema, and a golden inference. Warm up representative shapes to compile kernels and allocate memory before readiness. The first real user should not pay unpredictable compilation and cache cost.",
          "A replica is one serving instance. A router distributes requests across ready replicas, ideally with awareness of capacity, locality, or session/KV state. Replicas should be stateless where possible; shared mutable state complicates retries and scaling."
        ],
        diagram: diagram("serving", "Model-serving request path", ["Gateway + contract", "Feature/data access", "Queue + batcher", "Inference replicas", "Policy + response"], [[0,1],[1,2],[2,3],[3,4]], "Correlation, deadline, release identity, and cancellation travel through the entire path."),
        check: { question: "Why run a golden inference before readiness?", answer: "Successful deserialization does not prove preprocessing, feature order, runtime kernels, and output semantics are compatible." }
      },
      {
        id: "concurrency-batching",
        title: "Concurrency and batching exchange waiting time for efficiency",
        body: [
          "Concurrency is the number of in-flight requests. Increasing it can raise throughput until CPU, GPU, memory, or a dependency saturates; beyond that, queueing inflates tail latency and timeouts. Per-replica limits protect memory and ensure backpressure. Thread count should match workload—more threads around a serialized GPU kernel may add overhead without parallel compute.",
          "Static batching collects a fixed set; dynamic batching waits briefly to combine compatible requests up to a maximum size. Larger batches improve accelerator utilization and cost per item, but each request waits for the batch window and long shapes can force padding. Bucket by sequence length or input shape to reduce waste.",
          "For decoder LLMs, continuous batching inserts new sequences as others finish, improving utilization across variable generation lengths. KV-cache memory often caps concurrency. Track queue time separately from compute so autoscaling can respond to demand rather than blaming the model kernel."
        ],
        table: table("Serving lever and downstream effect", ["Lever ↑", "Likely gain", "Likely cost", "Measure"], [
          ["Concurrency", "Throughput until saturation", "Queueing, memory, contention", "p95/p99 queue + total"],
          ["Batch size", "GPU utilization", "Batch wait/padding/memory", "items/s and tail latency"],
          ["Replicas", "Parallel capacity/availability", "Cost and model copies", "utilization and SLO"],
          ["Max output tokens", "Response completeness", "Latency/KV/cost", "per-token latency and truncation"],
          ["Warmup shapes", "Stable first traffic", "Startup time/resources", "ready time and first-hit latency"]
        ]),
        failure: "Autoscaling on CPU for a GPU-bound server can leave queue latency exploding while CPU remains low. Choose signals tied to the bottleneck: queue depth/age, in-flight requests, accelerator utilization, or custom tokens-per-second saturation.",
        check: { question: "Why does dynamic batching increase throughput but risk p99 latency?", answer: "Requests wait for compatible peers and large batches; waiting and padding improve device efficiency but add tail delay." }
      },
      {
        id: "health-lifecycle",
        title: "Ready means correct, provisioned, and able to accept another request",
        body: [
          "Startup verifies artifact and warms the model. Readiness should fail while loading, when incompatible, or when a replica cannot safely accept traffic. Liveness detects internal deadlock. Overload should be expressed through bounded queue/rejection and scaling; toggling readiness too aggressively can oscillate routing.",
          "Graceful shutdown first stops admission, removes readiness, drains or cancels work according to deadline, persists safe state, and closes resources. For streaming generation, tell clients when termination interrupts output and avoid charging or executing tools twice on retry.",
          "Autoscaling needs startup-aware headroom because new replicas may take minutes to load. Scale from leading signals before queues violate SLO, keep minimum warm capacity, and model registry/storage bandwidth during a fleet cold start."
        ],
        example: "A model takes four minutes to load, while traffic doubles in one minute. HPA based only on CPU reacts late; new Pods all download a 12 GB artifact and saturate storage. Maintain warm replicas, cache immutable artifacts per node, scale on queue age, and cap simultaneous cold starts.",
        check: { question: "Why can a fleet cold start overload the model registry?", answer: "Many replicas simultaneously fetch a large artifact, turning scaling into a shared storage/network bottleneck." }
      },
      {
        id: "slo-capacity",
        title: "Serving design begins with an SLO and an arrival model",
        body: [
          "Specify availability, p95/p99 latency, throughput or QPS, maximum error rate, freshness, and cost per prediction. Benchmark realistic input shapes, concurrency, and model versions. Average latency at concurrency one cannot size peak traffic.",
          "Use Little’s Law as intuition: average in-flight work L ≈ arrival rate λ × average time W in a stable system. At 100 requests/s and 0.2 s average residence, about 20 requests are in flight on average; tail and bursts require headroom. When arrival exceeds service capacity, queues grow until rejection or failure.",
          "Load tests should include warm and cold paths, long prompts, dependency slowdown, replica loss, and cancellation. Capacity plans document per-replica throughput at the SLO, not maximum throughput after latency is already unacceptable."
        ],
        code: code("python", "@app.post(\"/v1/predict\")\nasync def predict(body: Request, request: StarletteRequest):\n    deadline = parse_deadline(request.headers, max_seconds=2.0)\n    if not admission.try_acquire():\n        raise HTTPException(503, detail={\"code\": \"OVERLOADED\"})\n    try:\n        item = await queue.submit(body, deadline=deadline, release_id=RELEASE_ID)\n        return await item.result(timeout=deadline.remaining())\n    finally:\n        admission.release()", [
          "A server-side deadline caps end-to-end residence.",
          "Admission control rejects before unbounded queue growth.",
          "Queue items retain release identity and remaining time.",
          "The concurrency slot is released on success, error, or cancellation."
        ], "It prevents overload from turning into an unbounded queue and ensures timed-out clients do not leave capacity permanently occupied."),
        check: { question: "What throughput number belongs in capacity planning?", answer: "Sustainable per-replica throughput while meeting the declared tail-latency, error, and resource constraints—not the highest observed rate after SLO failure." }
      }
    ],
    glossary: [
      ["Inference server", "Runtime that loads models and executes prediction requests."],
      ["Replica", "Independent serving instance of a release."],
      ["Request routing", "Assignment of incoming work to ready serving capacity."],
      ["Warmup", "Representative execution before readiness to initialize kernels/caches."],
      ["Concurrency", "Number of requests simultaneously in flight."],
      ["Dynamic batching", "Short-window grouping of compatible requests at runtime."],
      ["Continuous batching", "LLM scheduling that admits new sequences as active ones complete."],
      ["Admission control", "Bound on work accepted into a service."],
      ["Cold start", "Latency/resources required to create and initialize new capacity."],
      ["Queue time", "Time waiting before execution begins."],
      ["Sustainable throughput", "Load rate served while all declared objectives remain satisfied."],
      ["Little’s Law", "Stable-system relation L = λW among in-flight work, arrival rate, and residence time."]
    ],
    exercise: {
      duration: 90,
      title: "Capacity and failure test for a GPU inference service",
      brief: "SLO is 99.9% availability, p95 250 ms, p99 600 ms at 120 QPS; model load is 180 seconds and long requests use 4× memory.",
      parts: [
        "Diagram the request path and allocate the 600 ms tail budget.",
        "Benchmark concurrency and dynamic batch windows; bucket long requests.",
        "Set admission, queue, timeout, replica, warmup, and autoscaling policies.",
        "Test cold start, one-replica loss, registry slowdown, cancellation, and graceful rollout.",
        "Recommend capacity at the SLO with headroom and then complete the serving practice set."
      ],
      solution: "Measure validation, feature, queue, compute, and response separately. Find the knee where concurrency raises queue/p99 sharply; set per-replica admission below it. Use a short batch window and shape buckets, isolating long requests. Maintain minimum warm replicas because 180-second scale-out cannot absorb one-minute spikes; scale on queue age/in-flight plus GPU memory/utilization. Cache the pinned artifact, limit concurrent downloads, and drain on termination. Size on per-replica throughput at p99≤600 ms under long-request mix and N−1 replica failure, not a best-case peak."
    },
    sources: { core: ["kubernetesDeploy","kubernetesService","kubernetesProbes","kubernetesHPA"], deep: ["otel","azureWellArchitectedAI"] },
    quiz: [
      { concept:"Readiness", prompt:"The port opens before the 10 GB model passes its golden inference. Should the Pod be ready?", answer:1, options:[
        ["Yes, listening proves semantic compatibility.","It proves only a process bound a port."],
        ["No; readiness follows verified artifact load and serving checks.","Correct."],
        ["Yes, Kubernetes will validate predictions.","It only evaluates configured probes."],
        ["No, because model servers should never expose ports.","They need controlled networking."]
      ]},
      { concept:"Warmup", prompt:"Why warm representative input shapes?", answer:2, options:[
        ["To train on production labels.","Warmup is inference initialization."],
        ["To change the model version.","Weights stay fixed."],
        ["To initialize kernels/caches and expose shape-specific failures before traffic.","Correct."],
        ["To avoid all future drift.","Warmup cannot stabilize the world."]
      ]},
      { concept:"Concurrency", prompt:"Throughput plateaus while concurrency rises and p99 triples. What has happened?", answer:0, options:[
        ["The bottleneck saturated; extra work only queues/contends.","Correct."],
        ["The model necessarily became more accurate.","Quality is not implied."],
        ["Every request is now batched optimally.","The latency pattern suggests overload."],
        ["Arrival rate became zero.","Requests are accumulating."]
      ]},
      { concept:"Dynamic batching", prompt:"A batcher waits up to 20 ms for peers. What direct trade-off is introduced?", answer:3, options:[
        ["Zero GPU utilization.","Batching often improves it."],
        ["Unlimited context length.","Unrelated."],
        ["No queueing at all.","It deliberately waits."],
        ["Higher device efficiency at the cost of added waiting/tail risk.","Correct."],
      ]},
      { concept:"Autoscaling signals", prompt:"GPU is saturated and queue age rises, but CPU stays 20%. Why does CPU-only HPA fail?", answer:1, options:[
        ["CPU must always equal GPU usage.","They are distinct resources."],
        ["The scaling metric is disconnected from the actual bottleneck.","Correct. Use queue/in-flight/GPU signals."],
        ["HPA retrains the model.","It scales replicas."],
        ["Queue age cannot be measured.","It can be exported as a custom metric."]
      ]},
      { concept:"Cold start", prompt:"All new replicas download one large model simultaneously and storage slows. Which mitigation is best?", answer:2, options:[
        ["Increase simultaneous downloads without limit.","That worsens contention."],
        ["Resolve `latest` per replica.","That also risks version inconsistency."],
        ["Cache by immutable digest, stage artifacts, and limit concurrent cold starts.","Correct."],
        ["Disable readiness.","That sends traffic to unloaded Pods."]
      ]},
      { concept:"Admission control", prompt:"Why reject excess work before enqueueing it indefinitely?", answer:0, options:[
        ["Stale timed-out requests otherwise consume memory and worsen every caller’s latency.","Correct."],
        ["Rejection improves model training loss.","It protects serving stability."],
        ["Queues cannot store identifiers.","They can."],
        ["HTTP forbids waiting.","It does not, but waiting must be bounded."]
      ]},
      { concept:"Graceful shutdown", prompt:"What is the first serving action during planned termination?", answer:1, options:[
        ["Accept more long requests.","That prevents drain."],
        ["Stop new admission / become unready, then drain within the grace period.","Correct."],
        ["Delete the model registry.","Unrelated and destructive."],
        ["Change every score threshold.","Policy should remain stable."]
      ]},
      { concept:"Capacity", prompt:"A replica reaches 300 QPS but p99 is 4 seconds against a 600 ms SLO. What throughput should planning use?", answer:3, options:[
        ["300 QPS, because it is the maximum.","It violates the objective."],
        ["Zero, because one test failed.","Lower sustainable load may pass."],
        ["Average QPS from a warmup request.","One request does not characterize capacity."],
        ["The highest sustained rate that keeps p99, errors, and resources within SLO.","Correct."],
      ]},
      { concept:"Little’s Law", prompt:"A stable service receives 100 requests/s and average residence time is 0.2 s. About how many requests are in flight on average?", answer:0, options:[
        ["20","Correct. L≈100×0.2."],
        ["500","That divides rather than multiplies."],
        ["100","That would correspond to one second residence."],
        ["2,000","That is two orders too large."]
      ]}
    ]
  });
})();
