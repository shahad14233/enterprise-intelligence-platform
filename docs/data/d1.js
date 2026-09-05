(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 1,
    centralQuestion: "A table has millions of rows and hundreds of columns. Is it already a learning problem—or only stored activity?",
    objective: "Translate an operational question into defensible examples, labels, features, sampling rules, and quality tests; identify when more data increases confidence in the wrong population.",
    sections: [
      {
        id: "unit-of-analysis",
        title: "The row is an engineering decision",
        body: [
          "A dataset becomes a supervised learning dataset only after its unit of analysis is fixed. An example—or observation—is the object on which one prediction will be made: one invoice at approval time, one patient at triage, one machine at the start of a shift. Features are facts legitimately available at that decision time. The label or target is the outcome the system is asked to predict. A feature vector is the ordered numerical representation passed to the estimator; it is not the business record itself.",
          "This distinction prevents a common category error. If a customer table contains one row per transaction but the product asks for one churn score per customer-month, transaction rows are not independent examples. Heavy buyers contribute more rows, thereby receiving more weight, and transactions from the same customer can leak across splits. The correct dataset might aggregate transactions into a customer-month snapshot, attach a future 30-day churn label, and record a prediction timestamp that constrains every feature.",
          "Structured data has an explicit schema—columns, types, and relationships. Unstructured data such as images, audio, or free text still needs a structured prediction envelope: document ID, source, capture time, consent, label, and lineage. Expert practice starts by defining that envelope, because evaluation cannot rescue an ambiguous example."
        ],
        example: "A predictive-maintenance team wants to forecast compressor failure. ‘One sensor reading’ is a poor unit because labels apply to failure events, not individual milliseconds. A defensible example is one compressor at the end of each hour; features summarize only the preceding 24 hours; the label records failure in the following seven days. Now sampling, leakage, and operational cadence can be reasoned about.",
        consequence: "If the unit is wrong, confidence intervals, class prevalence, and capacity estimates are all wrong downstream. No model choice repairs a dataset that counted the same decision hundreds of times.",
        check: { question: "Why is prediction time part of the data definition?", answer: "It separates facts that are available to the decision from facts that occur later, making feature legality and label windows testable." }
      },
      {
        id: "types-and-meaning",
        title: "Types describe permissible operations, not just storage",
        body: [
          "Numerical features support arithmetic, but their meaning matters. Temperature differences are meaningful; identifiers written as numbers are categorical. A categorical feature represents membership. Nominal categories—city or device family—have no inherent order. Ordinal categories—low, medium, high—have an order but not necessarily equal distance. Treating a nominal code as a continuous number invents geometry: code 20 is not twice code 10, and category 3 is not necessarily closer to 2 than to 8.",
          "Targets require the same care. A proxy label is an observable stand-in for the real outcome: ‘case escalated’ may proxy ‘case was genuinely severe.’ The proxy can encode workflow, access, or human behavior instead of the underlying phenomenon. Noisy labels contain random or systematic errors. Random noise often limits the achievable signal; systematic noise can teach a stable but wrong pattern—for example, one clinic under-recording a diagnosis.",
          "Feature availability, units, allowed values, and semantic definitions therefore belong beside the data, not in institutional memory. An ‘income’ column without currency and reference period is not merely undocumented; it is analytically unsafe."
        ],
        table: table("Data role and engineering implication", ["Element", "Question to ask", "Failure if misread"], [
          ["Example", "What receives one prediction?", "Dependent rows and false sample size"],
          ["Feature", "Was it available at decision time?", "Leakage or unusable production input"],
          ["Label", "Does it measure the desired outcome?", "Optimization of a proxy"],
          ["Nominal", "Is any order real?", "Fabricated distance"],
          ["Ordinal", "Is order real but spacing unknown?", "Overstated arithmetic meaning"]
        ]),
        failure: "A team casts every integer column to numeric and lets a tree decide. Trees tolerate monotonic recoding better than linear models, but arbitrary codes still create unstable partitions and hide unseen-category behavior. Type semantics must be explicit even when the estimator seems forgiving.",
        check: { question: "Why can a high-agreement label still be a poor target?", answer: "Annotators may consistently measure the same proxy rather than the business outcome; agreement measures consistency, not construct validity." }
      },
      {
        id: "distribution-quality",
        title: "Quality is fitness for a deployment distribution",
        body: [
          "A data distribution describes how values and combinations occur in a population. A model learns associations weighted by its training distribution. Quantity reduces sampling uncertainty only when examples are relevant enough and labels are trustworthy enough. Ten million convenience-sampled urban cases can estimate the urban pattern precisely while remaining biased for rural deployment.",
          "Representativeness asks whether the development data covers the people, conditions, time periods, devices, and workflows encountered after release. Sampling bias arises when inclusion probabilities distort the population. Selection bias is broader: entry into the dataset depends on variables related to the outcome, sometimes after the decision. A credit model trained only on approved borrowers never observes repayment for rejected applicants; the observed sample is selected by the old policy.",
          "Data-quality checks must join technical validity with semantic validity. A value can parse as a date yet occur after the outcome. A heart rate of 18 may be a critical real observation, a unit conversion problem, or a dropped digit. An outlier is an observation unusual under a reference distribution; it is not synonymous with error. First trace provenance, units, timing, and population. Then decide whether to correct, exclude, transform, cap, or preserve it."
        ],
        example: "A manufacturing defect model improves after removing the most extreme vibration readings. Investigation shows those readings occur immediately before bearing seizures—the event the model must catch. Cleaning improved average loss by deleting the operationally valuable tail. The correct action is to verify sensors, preserve valid extremes, and evaluate recall on the high-vibration slice.",
        consequence: "An invalid value can destabilize training; deleting a valid rare case can erase safety-critical signal. The downstream effect depends on cause, so ‘outlier handling’ must begin with diagnosis rather than a percentile rule.",
        check: { question: "When can more rows make an estimate more confidently wrong?", answer: "When the sampling or labeling process is systematically biased; volume narrows variance around the biased estimand without fixing the bias." }
      },
      {
        id: "knowledge-map",
        title: "D1 expert knowledge map: evidence before optimization",
        body: [
          "Expert D1 reasoning follows an evidence chain. Define the decision and observation unit; locate the label in time; test identity, missingness, validity, and representativeness; encode transformations inside the validation boundary; choose a split that simulates deployment; diagnose bias and variance; then select metrics, calibration, and thresholds that express decision cost. Each link constrains the next.",
          "A high test score is credible only if this chain is credible. Certification scenarios often present a technically valid action—random cross-validation, global mean imputation, ROC-AUC, or oversampling—that is wrong because it violates a prior assumption. The professional response is to identify the violated assumption, predict the direction of bias, and choose an evaluation design aligned with production."
        ],
        diagram: diagram("flow", "From operational decision to defensible evidence", ["Decision", "Examples + time", "Quality + identity", "Split + pipeline", "Metric + threshold"], [[0,1],[1,2],[2,3],[3,4]], "A later stage cannot compensate for an invalid earlier contract."),
        check: { question: "Which comes first: selecting a model metric or defining the operational decision?", answer: "The decision. Error consequences and timing determine which labels, splits, and metrics are meaningful." }
      }
    ],
    glossary: [
      ["Example / observation", "The unit that receives one prediction."],
      ["Feature", "Information legitimately available to the model at prediction time."],
      ["Label / target", "The outcome the learning process is trained to predict."],
      ["Feature vector", "The ordered numerical representation of one example."],
      ["Nominal", "Categorical values with no intrinsic order."],
      ["Ordinal", "Categorical values with order but not guaranteed equal spacing."],
      ["Proxy label", "An observable substitute for the outcome of real interest."],
      ["Representativeness", "Coverage of the distribution and conditions where the model will operate."],
      ["Sampling bias", "Distortion caused by non-representative inclusion probabilities."],
      ["Outlier", "An observation unusually distant under a stated reference distribution; not automatically an error."]
    ],
    exercise: {
      duration: 35,
      title: "Design the prediction envelope",
      brief: "A hospital wants to predict unplanned readmission so care coordinators can intervene before discharge.",
      parts: [
        "Define the example, prediction timestamp, feature window, outcome window, and label.",
        "Classify six proposed fields—patient ID, age, discharge code, final billing adjustment, triage notes, and number of prior admissions—by role and availability.",
        "List three ways the training population could differ from future deployment.",
        "Write four data-contract assertions and one slice evaluation that would catch a harmful gap."
      ],
      solution: "Use one hospital encounter at the pre-discharge decision time. Features may include age, notes available by then, and prior admissions; patient ID is an identity/grouping key, not a predictive magnitude. A discharge code is legal only if finalized before scoring. A later billing adjustment is future information and must be excluded. Define readmission within 30 days to the same or an affiliated facility, including transfer rules. Contract checks should cover unique encounter IDs, timestamp ordering, allowed code sets, and label maturity. Compare performance by hospital, age band, and discharge pathway because capture and intervention capacity can differ."
    },
    sources: { core: ["googleML","googleNumeric","googleOverfit"], deep: ["sklearnPreprocess","googleFraming"] },
    quiz: [
      { concept:"Unit of analysis", prompt:"A churn table contains one row per support ticket, but the product sends one retention offer per account each month. What redesign is most defensible?", answer:1, options:[
        ["Keep ticket rows and weight every row equally.","This overweights accounts that open many tickets and makes the sample unit inconsistent with the decision."],
        ["Create one account-month snapshot using only history available at the scoring date.","Correct. It aligns one example, one decision, feature time, and the future churn window."],
        ["Deduplicate tickets with identical text.","Text deduplication does not resolve the mismatch between ticket rows and account decisions."],
        ["Use a deeper model to learn the account structure.","Architecture cannot correct an invalid observation unit or split dependence."]
      ]},
      { concept:"Proxy labels", prompt:"A severity model uses ‘case escalated’ as its label. One region escalates nearly every case because staffing policy differs. What is the main risk?", answer:2, options:[
        ["The feature matrix will be sparse.","Escalation policy does not imply sparse features."],
        ["The model will necessarily underfit.","Capacity is not the central issue; the target construct is."],
        ["It may learn regional escalation behavior instead of underlying severity.","Correct. The proxy is systematically influenced by workflow."],
        ["The labels are MCAR.","This is label-definition bias, not a missing-data mechanism."]
      ]},
      { concept:"Ordinal data", prompt:"A satisfaction field has {poor, fair, good, excellent}. Which statement is safest?", answer:3, options:[
        ["One-hot encoding is always invalid because order exists.","One-hot encoding can be reasonable when equal or monotonic effects should not be assumed."],
        ["Codes 1–4 prove equal distance between adjacent categories.","The labels establish order, not interval equality."],
        ["The field is nominal because it is text.","Storage type does not determine measurement semantics."],
        ["An ordinal encoding preserves order but adds a spacing assumption the model may exploit.","Correct. The encoding must be chosen with the estimator and relationship in mind."]
      ]},
      { concept:"Representativeness", prompt:"A vision model has two million daylight highway images and will be deployed on rural roads at night. Which addition most directly improves deployment evidence?", answer:0, options:[
        ["A deliberately sampled, labeled rural-night evaluation slice.","Correct. It measures the intended operating condition rather than only increasing volume."],
        ["More random daylight highway frames.","This reduces uncertainty in the already overrepresented condition."],
        ["A larger convolutional network.","Capacity cannot establish coverage of the target distribution."],
        ["Randomly duplicate rare labels.","Duplication changes training weights, not the missing deployment evidence."]
      ]},
      { concept:"Outliers", prompt:"Extreme temperature values strongly predict machine failure. Sensor calibration records show they are valid. What should the engineer do first?", answer:2, options:[
        ["Winsorize them to the 99th percentile.","Capping would weaken a verified predictive tail without an operational reason."],
        ["Delete them because robust models dislike outliers.","Unusual does not mean erroneous; deletion may remove the target signal."],
        ["Preserve them and evaluate performance specifically in the extreme range.","Correct. Valid safety-relevant extremes deserve slice evaluation."],
        ["Replace them with the global mean.","Mean replacement erases the mechanism and creates implausible records."]
      ]},
      { concept:"Selection bias", prompt:"A repayment model is trained only on borrowers approved by the previous policy. Which limitation is most important?", answer:1, options:[
        ["Approved borrowers cannot have missing values.","Approval does not determine missingness."],
        ["Outcomes for historically rejected applicants are unobserved, so generalization to them is not identified from this sample.","Correct. The old decision policy selected which labels could ever be observed."],
        ["Cross-validation becomes mathematically impossible.","Cross-validation can run, but it estimates performance on the selected population."],
        ["The model must use unsupervised learning.","Supervised learning remains possible for approved-like applicants; its scope is the issue."]
      ]},
      { concept:"Data quality", prompt:"A timestamp parses correctly but occurs two days after the prediction event. How should it be classified?", answer:0, options:[
        ["Technically valid but semantically invalid for that prediction.","Correct. Syntax is valid while temporal availability violates the feature contract."],
        ["An outlier that should be standardized.","Scaling does not repair time illegality."],
        ["A noisy label.","The problem concerns a feature timestamp, not label error."],
        ["Unstructured data.","A timestamp is structured; its semantics are wrong."]
      ]}
    ]
  });

  register({
    id: 2,
    centralQuestion: "If a value is absent, is the safest action to fill it—or to ask why it disappeared?",
    objective: "Diagnose MCAR, MAR, and MNAR mechanisms; select deletion, conditional imputation, and missing indicators without leakage; explain the bias each choice can introduce.",
    sections: [
      {
        id: "mechanism",
        title: "Missingness is generated by a process",
        body: [
          "Let R indicate whether a value is observed. Missing completely at random (MCAR) means the probability of missingness does not depend on observed or unobserved data relevant to the analysis. A random file-transfer failure may approximate MCAR. Under MCAR, complete cases remain representative in expectation, though deleting them wastes information and increases variance.",
          "Missing at random (MAR) means missingness can depend on observed variables after conditioning on them, but not on the missing value itself. Income may be less often recorded for self-employed applicants, while employment type is observed. Conditional imputation can use that observed structure. MAR does not mean ‘random-looking’; it is a conditional independence assumption.",
          "Missing not at random (MNAR) means the probability of missingness still depends on the unseen value or an unobserved cause after accounting for recorded variables. High earners may intentionally omit income. Severe symptoms may be absent because the sickest patients could not answer. Observed data alone generally cannot prove MAR versus MNAR; domain knowledge, process tracing, sensitivity analysis, and new data collection are required."
        ],
        table: table("Mechanism, evidence, and consequence", ["Mechanism", "Missingness depends on", "Plausible response", "Main risk"], [
          ["MCAR", "Neither observed nor missing values", "Deletion or simple imputation may be unbiased", "Lost precision"],
          ["MAR", "Observed variables after conditioning", "Conditional/model-based imputation", "Wrong conditioning model"],
          ["MNAR", "The missing value or unobserved cause", "Process change, sensitivity analysis, explicit missingness modeling", "Non-identifiable bias"]
        ]),
        failure: "Calling all missingness ‘MAR because we have other columns’ is unjustified. MAR asserts that the observed columns are sufficient to explain selection after conditioning; availability of covariates does not establish that sufficiency.",
        check: { question: "Can a histogram of observed values prove that missing income is MNAR?", answer: "No. Values that are missing are unavailable by definition; observed-data patterns can challenge assumptions but usually cannot identify MNAR without process knowledge or additional data." }
      },
      {
        id: "treatment",
        title: "Every treatment changes a distribution",
        body: [
          "Dropping rows changes who remains. Mean imputation preserves row count but compresses variance, weakens correlations, and creates an artificial spike at the mean. Median imputation is more resistant to extreme observed values yet still treats different subgroups as exchangeable. Conditional imputation—by group or predictive model—can preserve relationships better, but it imports assumptions from the imputation model and can make uncertainty look smaller than it is.",
          "A missing indicator can preserve signal from the collection process. If ‘lab not ordered’ reflects a clinician’s judgment, the indicator may be predictive. It also creates a dependency on workflow: if the hospital changes ordering policy, the learned signal drifts even if patient biology does not. Indicators should therefore be monitored as operational features, not celebrated as free accuracy.",
          "MNAR requires explicit humility. Possible actions include changing the collection process, obtaining a validation sample, bounding results under different assumptions, or deploying a model whose decision does not depend strongly on the missing field. A sophisticated imputer does not convert unobserved causal information into observed truth."
        ],
        example: "In a salary model, filling all missing salaries with the global median pushes uncertain employees toward the center. If senior executives disproportionately withhold salary, the model understates the upper tail and may also learn that ‘missing’ implies median-level pay. A role-conditioned imputation plus indicator is more transparent, but an MNAR sensitivity analysis should test higher plausible values for missing executive salaries.",
        consequence: "Imputation affects coefficient magnitudes, distances, calibration, and subgroup errors. The relevant question is not ‘Did NaNs disappear?’ but ‘Which distribution and relationships did the treatment assert?’",
        check: { question: "Why can a missing indicator improve validation yet be risky in production?", answer: "It may encode a stable workflow during development that changes after deployment, turning an operational shortcut into drift." }
      },
      {
        id: "pipeline",
        title: "Fit imputation only on the training evidence",
        body: [
          "An imputer has learned parameters: means, medians, category frequencies, or predictive relationships. Computing them before splitting allows validation or test observations to influence training-time transformations. This preprocessing leakage often looks harmless because labels were not used, yet the evaluation distribution has still shaped the model input.",
          "The protection is structural. Place preprocessing and the estimator in one pipeline. During cross-validation, each fold fits the imputer and scaler on that fold’s training partition and applies the fitted transformation to its validation partition. For mixed data, a column transformer gives numerical and categorical branches separate rules while preserving a single fit boundary."
        ],
        code: code("python", "from sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\nnum = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"median\", add_indicator=True)),\n    (\"scale\", StandardScaler())\n])\ncat = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"most_frequent\")),\n    (\"encode\", OneHotEncoder(handle_unknown=\"ignore\"))\n])\nprep = ColumnTransformer([(\"num\", num, [\"age\", \"income\"]),\n                          (\"cat\", cat, [\"employment_type\"])])\nmodel = Pipeline([(\"prep\", prep),\n                  (\"clf\", LogisticRegression(max_iter=1000))])", [
          "`SimpleImputer` learns medians only when `model.fit` is called.",
          "`add_indicator=True` retains the fact that a numeric value was missing.",
          "`handle_unknown='ignore'` defines behavior for categories first seen after training.",
          "The outer pipeline makes cross-validation refit every learned transformation inside each fold."
        ], "It prevents validation rows from affecting imputation statistics or scaling parameters."),
        diagram: diagram("split", "Leakage-safe preprocessing boundary", ["Raw development data", "CV training fold", "Fit imputer + model", "Validation fold", "Transform + score"], [[0,1],[1,2],[0,3],[2,4],[3,4]], "Validation data is transformed with training-fitted state; it never participates in fitting that state."),
        failure: "Creating an imputed CSV once and then cross-validating it is still leakage. The fact that the imputation happened in a separate notebook does not change the information boundary.",
        check: { question: "During five-fold CV, how many times should a median imputer be fitted?", answer: "Five times—once on the training portion of each fold (and once more on all development data only after model selection for the final fitted model)." }
      }
    ],
    glossary: [
      ["Missingness indicator", "A feature recording whether another value was absent."],
      ["MCAR", "Missingness independent of observed and unobserved analysis variables."],
      ["MAR", "Missingness explainable by observed variables after conditioning."],
      ["MNAR", "Missingness that still depends on the unseen value or an unobserved cause."],
      ["Imputation", "Replacing missing values according to an estimated or fixed rule."],
      ["Conditional imputation", "Imputation that uses other variables or subgroup information."],
      ["Preprocessing leakage", "Evaluation information influencing learned transformations."],
      ["Sensitivity analysis", "Recomputing conclusions under plausible alternative assumptions."]
    ],
    exercise: {
      duration: 40,
      title: "Missingness investigation for credit risk",
      brief: "A credit dataset has 28% missing income, 3% missing age, and 41% missing employer tenure.",
      parts: [
        "Draw a missingness matrix by employment type, application channel, and eventual default.",
        "Propose at least two plausible mechanisms for each field and evidence that could distinguish them.",
        "Build a leakage-safe numerical/categorical pipeline and compare complete-case, simple, and conditional strategies under the same folds.",
        "Write a sensitivity test for the possibility that high earners disproportionately omit income."
      ],
      solution: "Treat mechanisms as hypotheses. Age may be MCAR-like due to isolated parsing failures; tenure may be structurally absent for self-employed applicants and thus MAR conditional on employment type; income may be MNAR if disclosure depends on income itself. Split first, then compare pipelines within identical group-aware folds. Report coverage and subgroup metrics, not only mean AUC. For MNAR sensitivity, shift missing-income imputations across plausible quantiles for relevant employment groups and inspect ranking, approval, and calibration stability."
    },
    sources: { core: ["sklearnImpute","sklearnPipeline"], deep: ["googleOverfit","sklearnCV"] },
    quiz: [
      { concept:"MCAR", prompt:"A storage node randomly loses 2% of sensor packets, independent of machine, reading, and failure state. Which mechanism is the best working assumption?", answer:0, options:[
        ["MCAR","Correct, if the failure truly has no dependence on recorded or unrecorded analysis variables."],
        ["MAR","MAR would require dependence on observed variables."],
        ["MNAR","MNAR would require dependence on the missing reading or an unobserved relevant cause."],
        ["Target leakage","Missingness mechanism is separate from future-label leakage."]
      ]},
      { concept:"MAR", prompt:"Employer tenure is usually absent for self-employed applicants, and employment type is recorded. What treatment best matches an MAR working model?", answer:2, options:[
        ["Drop every applicant with missing tenure.","Deletion changes the employment mix and discards a large structured group."],
        ["Use the overall mean and remove employment type.","This ignores the observed driver of missingness."],
        ["Impute conditionally on employment type and retain a missing indicator.","Correct. It uses the observed variable that explains missingness and preserves the collection signal."],
        ["Assume the unseen tenure is always zero.","That is a substantive assertion, not a consequence of MAR."]
      ]},
      { concept:"MNAR", prompt:"Patients with the highest pain intentionally decline to report a score. Why can ordinary observed-data validation not settle the mechanism?", answer:1, options:[
        ["Pain is an ordinal feature.","Ordinal measurement affects modeling but not identifiability of unseen values."],
        ["The probability of absence depends on the value that is not observed.","Correct. The decisive relationship is hidden, so additional assumptions or evidence are needed."],
        ["Validation sets never contain missing data.","They can contain missing data; the unknown score remains unknown."],
        ["Only deep learning can model MNAR.","Model capacity does not reveal unobserved truth."]
      ]},
      { concept:"Imputation bias", prompt:"What is the most direct statistical effect of global mean imputation for a continuous feature?", answer:3, options:[
        ["It guarantees unbiased coefficients.","Bias depends on the mechanism and model; no such guarantee exists."],
        ["It increases the observed variance.","Values are concentrated at the mean, so variance is typically reduced."],
        ["It preserves all correlations.","Replacing values by a constant generally attenuates relationships."],
        ["It creates a spike at the mean and usually compresses variance.","Correct. Those changes can distort distances and coefficients."]
      ]},
      { concept:"Missing indicators", prompt:"A ‘test not ordered’ flag predicts low disease risk because clinicians selectively order tests. The hospital later mandates universal testing. What changes?", answer:0, options:[
        ["The workflow signal in missingness disappears, creating drift.","Correct. The indicator encoded clinician behavior that the new policy removes."],
        ["The label becomes automatically balanced.","Testing policy does not guarantee label balance."],
        ["MCAR becomes target leakage.","The issue is workflow-driven feature drift, not necessarily leakage."],
        ["The model gains more regularization.","Collection changes do not add a regularization penalty."]
      ]},
      { concept:"Preprocessing leakage", prompt:"An analyst fits an iterative imputer on all rows, saves the completed table, then performs five-fold CV. What is wrong?", answer:2, options:[
        ["Iterative imputation is never allowed.","It is a valid technique when its assumptions and validation boundary are respected."],
        ["Five folds are always too few.","Fold count is not the primary defect."],
        ["Each validation fold influenced the imputation model used to transform its training fold.","Correct. The learned preprocessing saw held-out distributions."],
        ["Saving a CSV changes numerical precision too much.","Serialization is secondary to the information leak."]
      ]},
      { concept:"Sensitivity analysis", prompt:"Which analysis is most informative when high-income non-disclosure may be MNAR?", answer:1, options:[
        ["Report only the complete-case accuracy.","That conditions on disclosure and can hide the selection problem."],
        ["Vary plausible imputed values for non-disclosers and inspect decision stability.","Correct. It exposes how conclusions depend on an untestable assumption."],
        ["Choose the imputer with the lowest training error.","Training fit does not validate the missingness assumption."],
        ["Remove the missing indicator from every model.","That discards process information without resolving MNAR."]
      ]}
    ]
  });

  register({
    id: 3,
    centralQuestion: "When two rows look alike, are they duplicate records—or evidence that two systems disagree about one entity?",
    objective: "Separate exact deduplication from entity resolution; quantify identity-induced metric distortion; design schema, contract, and lineage controls that prevent recurrence.",
    sections: [
      {
        id: "duplicate-types",
        title: "Duplicate bytes and duplicate identities are different problems",
        body: [
          "Exact duplicates repeat the same record under the fields that define a row. They often arise from retries, append errors, or repeated extracts. If the record is an event, a safe deduplication key may include event ID and source version; dropping rows that happen to share all visible values can erase legitimate repeated events.",
          "Entity resolution asks whether non-identical records refer to the same real-world entity. ‘A. Rahman’, ‘Ahmed Al-Rahman’, and two phone formats may describe one customer. Resolution uses deterministic rules, standardized identifiers, probabilistic matching, or learned similarity. It should produce a canonical entity plus confidence and provenance—not silently overwrite the source records.",
          "The distinction is causal. Exact duplication inflates event counts. Fragmented identity inflates entity counts and divides histories. Over-merging does the opposite: two people become one, creating impossible sequences and privacy risk. A single `drop_duplicates()` call cannot adjudicate identity."
        ],
        table: table("Identity defect diagnosis", ["Defect", "Typical evidence", "Metric distortion", "Safe control"], [
          ["Exact duplicate", "Same immutable event ID and payload", "Inflated event volume", "Idempotency key + exact dedupe"],
          ["Fragmented entity", "Similar attributes, different source IDs", "Inflated customers; split behavior", "Canonical ID with match confidence"],
          ["Over-merged entity", "Conflicting stable attributes or simultaneous activity", "Deflated customers; mixed labels", "Conflict rules + manual review band"]
        ]),
        failure: "Using name equality as the customer key misses spelling variation; using fuzzy name alone merges relatives and common names. Identity evidence must combine stable attributes, temporal plausibility, and source reliability.",
        check: { question: "Why should source rows usually be retained after entity resolution?", answer: "They preserve auditability, allow revised matching rules, and show which claims produced the canonical entity." }
      },
      {
        id: "metric-distortion",
        title: "Identity errors change denominators and histories",
        body: [
          "Suppose one retained customer appears under three IDs. Customer count rises by two, purchases are distributed across thin profiles, and the real customer may look inactive under two identities. A retention rate computed as retained customers divided by eligible customers can fall because fragmented identities enlarge the denominator and break longitudinal linkage.",
          "In model training, identity errors cross more boundaries. If aliases enter different folds, the model sees almost the same person in train and validation, inflating measured generalization. If an over-merged identity contains both churn and non-churn episodes at the same timestamp, the label becomes contradictory. Group-aware splitting is only as good as the grouping key.",
          "Measure identity quality using labeled candidate pairs where possible: pairwise precision protects against harmful false merges; pairwise recall measures missed links. Operationally, create a review band for uncertain matches and monitor the effect of threshold changes on entity counts and key business metrics."
        ],
        example: "A streaming service reports a retention improvement after switching identity vendors. The number of ‘new’ users falls sharply because device-only profiles now link to accounts. The numerator and denominator changed; the product may be unchanged. Recompute historical metrics under a stable identity version or disclose the break in series.",
        consequence: "Identity logic is upstream of labels, features, splits, and KPIs. Changing it is a data-model release, not routine cleaning.",
        check: { question: "If duplicate customers cross train and test, which direction is evaluation usually biased?", answer: "Optimistically: the model can exploit person-specific patterns already present in training, so test performance overstates performance on genuinely unseen entities." }
      },
      {
        id: "contracts-lineage",
        title: "Move from repair to prevention with contracts and lineage",
        body: [
          "Schema validation checks structural expectations: required fields, types, nullability, allowed categories, ranges, uniqueness, and timestamp ordering. A data contract adds semantics and ownership: what one row means, update cadence, time zone, units, acceptable delay, compatibility rules, and what producers promise when changing a field. Validation detects a breach; the contract establishes why it is a breach and who must respond.",
          "Lineage records how a dataset, feature, or model artifact was derived: source versions, transformations, code revision, execution, and downstream consumers. With lineage, an altered customer-key rule can be traced to affected features, models, dashboards, and decisions. Without it, the team may fix a table while stale model artifacts continue serving.",
          "Contracts should fail deliberately. A new unseen category may be accepted and logged, quarantined, or cause the pipeline to stop depending on risk. Silent coercion is dangerous: parsing an invalid date as null converts a contract breach into missingness and hides the producer failure."
        ],
        code: code("python", "from pydantic import BaseModel, Field, field_validator\nfrom datetime import datetime\n\nclass ScoringRecord(BaseModel):\n    customer_id: str = Field(min_length=1)\n    event_time: datetime\n    prediction_time: datetime\n    balance_sar: float = Field(ge=0, le=10_000_000)\n\n    @field_validator(\"prediction_time\")\n    @classmethod\n    def prediction_after_event(cls, value, info):\n        event = info.data.get(\"event_time\")\n        if event and value < event:\n            raise ValueError(\"prediction_time precedes event_time\")\n        return value", [
          "Typed fields reject malformed input before feature code runs.",
          "Bounds encode a documented business range rather than silently clipping.",
          "The cross-field validator makes temporal order executable."
        ], "It prevents malformed and temporally impossible records from being silently converted into model features."),
        check: { question: "What does lineage add beyond schema validation?", answer: "It connects a validated or breached asset to its sources, transformations, versions, and downstream consumers, enabling impact analysis and reproducibility." }
      }
    ],
    glossary: [
      ["Exact duplicate", "A repeated record under an explicit event or row identity."],
      ["Entity resolution", "Linking distinct records believed to refer to one real-world entity."],
      ["Canonical entity", "The durable identity to which source records are linked."],
      ["False merge", "Incorrectly combining different entities."],
      ["Missed link", "Failing to combine records belonging to the same entity."],
      ["Schema validation", "Executable checks on structure, types, values, and relationships."],
      ["Data contract", "Producer-consumer agreement covering semantics, quality, cadence, and change."],
      ["Lineage", "Trace of sources, transformations, versions, executions, and consumers."],
      ["Idempotency key", "Stable identifier used to make repeated ingestion safe."]
    ],
    exercise: {
      duration: 35,
      title: "Audit customer identity before churn modeling",
      brief: "Three source systems use account number, email, and phone; a sample shows aliases, shared family phones, and retry duplicates.",
      parts: [
        "Define exact-event duplicate keys separately from entity-match features.",
        "Create deterministic matches, non-matches, and an uncertain review band.",
        "Calculate how two false merges and five missed links change customer count and churn denominator in a 100-customer sample.",
        "Draft a contract for canonical customer ID and a lineage record for the match rules."
      ],
      solution: "Use immutable source event ID plus source system for exact retries. For entities, exact verified national/customer IDs may auto-link; conflicting verified IDs should block a merge; normalized email/phone/name combinations can score candidates, with shared contacts reducing confidence. Preserve source IDs and match evidence. Five missed links can add up to five apparent customers; two false merges can remove two, but churn effects depend on episode labels. Version the rules, threshold, reference tables, review decisions, and affected feature snapshot."
    },
    sources: { core: ["googleOverfit","jsonSchema"], deep: ["sklearnCV","fastapi"] },
    quiz: [
      { concept:"Exact duplicates", prompt:"An event producer retries after a timeout and emits the same immutable event ID twice. What is the safest ingestion behavior?", answer:1, options:[
        ["Fuzzy-match all payload fields.","A stable event identity makes probabilistic matching unnecessary and less safe."],
        ["Use the event ID as an idempotency key and retain one processed event.","Correct. Retries become safe without deleting legitimate similar events."],
        ["Count both because both arrived.","Arrival count would inflate business events."],
        ["Drop every row sharing the same timestamp.","Different events may legitimately share a timestamp."]
      ]},
      { concept:"Entity resolution", prompt:"Two customer rows share a common surname and home phone but have conflicting verified national IDs. What is the best default?", answer:2, options:[
        ["Merge because two fields agree.","Shared family attributes are weak compared with conflicting verified identity."],
        ["Keep whichever row is newer and delete the other.","Recency does not resolve identity and destroys provenance."],
        ["Block automatic merge and route the pair for review or stronger evidence.","Correct. The conflict is high-cost and should override weak similarity."],
        ["Average their numeric features.","Averaging would fabricate an entity before resolving identity."]
      ]},
      { concept:"Metric distortion", prompt:"A retailer resolves many device-only profiles into existing customers. New-customer count drops. What must analysts do before claiming acquisition declined?", answer:0, options:[
        ["Separate the identity-definition change from real behavioral change.","Correct. The denominator and classification rule changed."],
        ["Increase model regularization.","The break is in measurement, not model complexity."],
        ["Use only exact duplicates.","The change arose from entity linkage, not repeat rows."],
        ["Convert customer IDs to integers.","Storage type does not stabilize identity semantics."]
      ]},
      { concept:"Split contamination", prompt:"Aliases of the same patient appear in training and test under different IDs. Which metric is most likely affected?", answer:3, options:[
        ["Only training runtime.","The primary issue is evaluation independence, not runtime."],
        ["Only class prevalence.","Prevalence may move, but memorization directly biases performance."],
        ["Only schema validity.","Rows can be schema-valid while entity-contaminated."],
        ["Test performance is likely optimistic because the person is not truly unseen.","Correct. Near-duplicate personal patterns cross the split boundary."]
      ]},
      { concept:"Data contracts", prompt:"A producer changes `amount` from SAR to halalas without renaming the field. Which contract element would have prevented silent misuse?", answer:1, options:[
        ["A higher model AUC threshold.","Evaluation gates do not define input units."],
        ["An explicit unit and compatibility rule for the field.","Correct. Semantic units and breaking-change handling belong in the contract."],
        ["A missing-value indicator.","Values are present but scaled by 100."],
        ["A random train/test split.","Splitting cannot detect an undocumented unit change."]
      ]},
      { concept:"Lineage", prompt:"An identity-rule version caused feature changes. Which record most directly supports impact analysis?", answer:2, options:[
        ["A screenshot of the dashboard.","A screenshot lacks derivation and consumer links."],
        ["The latest customer count only.","A total does not identify transformations or affected artifacts."],
        ["Source versions, rule commit, execution ID, feature snapshot, and downstream model versions.","Correct. These links make the change traceable."],
        ["A list of model hyperparameters without data references.","Hyperparameters cannot trace an upstream identity change."]
      ]},
      { concept:"Schema validation", prompt:"A parser converts impossible dates to null and continues. Why is this dangerous?", answer:0, options:[
        ["It disguises a producer contract breach as ordinary missingness.","Correct. The original invalid state and accountability are lost."],
        ["Nulls always cause overfitting.","Missingness has varied effects and can be handled explicitly."],
        ["Dates should always be nominal categories.","Dates carry temporal semantics; categorization is not the remedy."],
        ["Lineage becomes unnecessary.","Silent coercion makes lineage more important, not less."]
      ]}
    ]
  });

  register({
    id: 4,
    centralQuestion: "If two features use different units and heavy-tailed distributions, which geometry should the model see?",
    objective: "Choose scaling, transformation, clipping, and binning based on estimator behavior and distribution shape; preserve legitimate extremes and fit every transformation without leakage.",
    sections: [
      {
        id: "scale",
        title: "Scaling changes optimization and distance—not information",
        body: [
          "Standardization computes z = (x − mean) / standard deviation, placing training features on comparable centered scales. It is valuable when optimization, regularization, kernels, or distances react to magnitude. A one-unit coefficient penalty should not mean something radically different merely because one feature is measured in riyals and another in years.",
          "Min-max scaling maps a training range, often to [0,1]. It retains relative positions within that range but is highly sensitive to extreme minima and maxima. New production values can fall outside [0,1]; clipping them hides the extent of shift. Normalization is an overloaded term: it may mean rescaling a feature or scaling each example vector to unit norm. Unit-norm scaling changes vector magnitude and is appropriate when direction, such as text term proportions, matters more than total size.",
          "Tree splits are usually invariant to monotonic rescaling, so standardization rarely changes a single tree’s ordering. Linear models with regularization, k-nearest neighbors, SVMs, and gradient-based neural networks are much more sensitive. The choice follows the model’s mechanism rather than a universal cleaning checklist."
        ],
        table: table("Transformation as an engineering choice", ["Method", "What it changes", "Useful when", "Watch for"], [
          ["Z-score", "Center and scale by training mean/SD", "Distance, regularization, gradient conditioning", "Outlier-sensitive statistics"],
          ["Min-max", "Maps training extrema to a fixed range", "Bounded inputs or known range", "Extreme sensitivity; future out-of-range values"],
          ["Unit norm", "Scales each row vector to length one", "Direction matters more than magnitude", "Destroys meaningful total magnitude"],
          ["Log1p", "Compresses positive right tail", "Multiplicative effects; orders of magnitude", "Zeros/negatives and changed interpretation"]
        ]),
        check: { question: "Why can scaling affect an L2-regularized linear model even though it contains the same raw information?", answer: "The penalty acts on coefficient magnitude. Feature scale determines how large a coefficient must be to produce the same prediction, so unscaled features receive unequal effective penalties." }
      },
      {
        id: "shape",
        title: "Transform shape only when the implied relationship is defensible",
        body: [
          "A log transformation compresses large positive values and converts multiplicative ratios into additive differences. If risk rises similarly when income doubles from 5,000 to 10,000 and from 50,000 to 100,000, log income may make the relation easier for a linear model. `log1p` handles zero but not arbitrary negative values. The coefficient then describes change per log unit, not per original currency unit.",
          "Clipping caps values at chosen limits. It can contain verified sensor saturation or reduce the leverage of corrupted extremes, but it makes every value beyond the cap indistinguishable. Binning turns a continuum into intervals, introducing discontinuities and discarding within-bin order. It can express known policy thresholds or nonlinear risk bands, yet data-derived bins must be fitted inside folds.",
          "Interaction terms and feature crosses allow a model to represent joint effects: temperature may be risky only when pressure is also high. An explicit product term helps a linear model; trees may discover such interactions without manual crosses. Each added interaction increases feature space and overfitting opportunity, especially with sparse high-cardinality inputs."
        ],
        example: "A fraud model uses transaction amount from 1 to 500,000 SAR. Min-max scaling makes nearly all routine transactions cluster near zero because a few valid corporate payments define the maximum. A log1p transform followed by standardization represents ratios more evenly. The large payments must still be evaluated as their own slice; compression is not permission to ignore them.",
        failure: "Clipping every feature at the first and ninety-ninth percentiles before investigating cause can erase rare fraud, failure, or safety events. A percentile is a frequency description, not an error detector.",
        check: { question: "When is binning more defensible than a smooth transform?", answer: "When real decision or physical regimes have meaningful thresholds, or when a deliberately coarse monotonic relationship is preferred and validated." }
      },
      {
        id: "fit-boundary",
        title: "Transformation parameters are model state",
        body: [
          "Means, standard deviations, minima, maxima, quantiles, bin edges, and selected interactions are learned from data. They belong to the fitted artifact and must be versioned and deployed with the model. Recomputing a scaler on each production batch shifts the coordinate system under a fixed model; fitting on test data leaks evaluation information.",
          "A column transformer can preserve this state consistently across numeric and categorical branches. The production service should load the same pipeline artifact and validate raw inputs before transformation. Monitoring should observe raw and transformed distributions: raw drift tells you the world changed; transformed drift tells you what the model actually received."
        ],
        code: code("python", "from sklearn.compose import ColumnTransformer\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import FunctionTransformer, StandardScaler\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.linear_model import Ridge\nimport numpy as np\n\namount_pipe = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"median\")),\n    (\"log\", FunctionTransformer(np.log1p, feature_names_out=\"one-to-one\")),\n    (\"scale\", StandardScaler())\n])\nprep = ColumnTransformer([(\"amount\", amount_pipe, [\"transaction_amount\"])],\n                         remainder=\"passthrough\")\nmodel = Pipeline([(\"prep\", prep), (\"regressor\", Ridge(alpha=1.0))])", [
          "The positive-valued amount is imputed before `log1p`.",
          "Scaling is fitted after the log transform, so it describes the transformed training distribution.",
          "The Ridge estimator and transformation state serialize as one artifact."
        ], "It prevents different notebooks or serving code from applying transformations in a different order or with production-fitted statistics."),
        check: { question: "Why should raw metrics be monitored when the model consumes standardized values?", answer: "Standardization can mask how the source changed; raw monitoring explains the real-world drift while transformed monitoring shows model exposure." }
      }
    ],
    glossary: [
      ["Standardization", "Centering by a training mean and scaling by a training standard deviation."],
      ["Min-max scaling", "Linear mapping based on training minima and maxima."],
      ["Unit normalization", "Scaling each example vector to a fixed norm."],
      ["Log transformation", "Nonlinear compression that turns ratios into additive differences."],
      ["Clipping", "Capping values at lower or upper limits."],
      ["Binning", "Mapping continuous values into discrete intervals."],
      ["Interaction term", "A feature representing a joint effect, often a product."],
      ["Conditioning", "Numerical geometry that influences how efficiently an optimizer can learn."]
    ],
    exercise: {
      duration: 35,
      title: "Transform a skewed transaction dataset",
      brief: "Compare a regularized logistic model and a random forest using age, transaction amount, account balance, and device count.",
      parts: [
        "Plot distributions and verify whether extreme amounts are valid.",
        "Compare no scaling, z-score scaling, and log1p-plus-z-score for the linear model.",
        "Keep transformations inside cross-validation and report fold variance.",
        "Explain why the random forest may react differently and inspect the extreme-amount slice."
      ],
      solution: "Validate units and tail records first. For the linear model, use median imputation, log1p for nonnegative heavy-tailed amounts, and standardization; compare by identical stratified folds. Coefficient conditioning and L2 fairness should improve. The forest usually preserves ordering under monotonic transforms, though imputation and binning can still change it. Report PR-AUC plus recall and precision in the high-amount slice so an average gain does not conceal lost rare-event performance."
    },
    sources: { core: ["googleNumeric","sklearnPreprocess","sklearnPipeline"], deep: ["sklearnCV","googleOverfit"] },
    quiz: [
      { concept:"Standardization", prompt:"An L2-logistic model combines age in years and account balance in halalas. Why standardize?", answer:1, options:[
        ["To make every feature normally distributed.","Z-scoring changes center and scale, not distribution shape."],
        ["To make optimization and coefficient penalties comparable across units.","Correct. Equivalent predictive effects no longer require radically different coefficient magnitudes."],
        ["To remove all outliers.","Standardization retains extreme observations as extreme z-scores."],
        ["To prevent categorical leakage.","Scaling numerical fields does not address categorical leakage."]
      ]},
      { concept:"Min-max scaling", prompt:"A scaler fitted to amounts 0–10,000 sees a valid production amount of 15,000. What is true without clipping?", answer:3, options:[
        ["It becomes missing.","The transform is defined for out-of-range inputs."],
        ["It maps to exactly 1.","Only the training maximum maps to 1 unless clipping is enabled."],
        ["The scaler refits automatically.","A serving transform must not refit on each request."],
        ["It maps above 1, exposing an out-of-range condition.","Correct. That can be useful drift evidence."]
      ]},
      { concept:"Log transform", prompt:"Risk changes roughly with percentage increases in a positive-valued amount. Which representation best supports a linear model?", answer:0, options:[
        ["A log-transformed amount, validated against the relationship.","Correct. Equal ratios become more nearly equal additive steps."],
        ["An arbitrary integer category code.","This discards ordered magnitude and invents category geometry."],
        ["A customer identifier.","Identity is not a magnitude representation."],
        ["The global rank computed using test data.","That would leak test-distribution information."]
      ]},
      { concept:"Clipping", prompt:"A pressure sensor saturates physically at 300 kPa and reports impossible spikes above 5,000 due to a known fault. What is a defensible design?", answer:2, options:[
        ["Delete all high-pressure events.","Valid near-limit events may contain failure signal."],
        ["Use the 99th percentile without documenting the sensor.","A sample percentile ignores the known physical mechanism."],
        ["Flag invalid fault readings, enforce the physical contract, and preserve valid near-limit values.","Correct. Treatment follows provenance and physical bounds."],
        ["Standardize until the spikes appear small.","Scaling does not make invalid observations valid."]
      ]},
      { concept:"Binning", prompt:"A lending policy changes at a legally defined age threshold. What advantage can an explicit bin provide?", answer:1, options:[
        ["It guarantees fairness.","Policy encoding can still have fairness and legal implications."],
        ["It lets a simple model represent the known discontinuity directly.","Correct. The boundary has real semantic meaning."],
        ["It preserves all within-bin information.","Binning discards within-bin variation."],
        ["It removes the need for validation.","Any engineered boundary must still be validated."]
      ]},
      { concept:"Transformation state", prompt:"A production service recomputes the scaler mean on each hourly batch while keeping the model fixed. What failure occurs?", answer:0, options:[
        ["The coordinate system changes beneath fixed coefficients.","Correct. Identical raw inputs can produce different transformed values by batch."],
        ["The model becomes a random forest.","Scaling state does not change estimator class."],
        ["The label becomes MCAR.","This is serving skew, not missingness."],
        ["Cross-validation becomes stratified.","Serving behavior is unrelated to fold stratification."]
      ]},
      { concept:"Model dependence", prompt:"Which model is usually least affected by monotonic z-score rescaling of a single continuous feature?", answer:2, options:[
        ["k-nearest neighbors","Distances depend directly on scale."],
        ["L2-regularized logistic regression","Regularization and optimization depend on scale."],
        ["A decision tree using threshold splits","Correct. Ordering is preserved, so equivalent split points exist."],
        ["RBF-kernel SVM","Kernel distances change with scale."]
      ]}
    ]
  });

  register({
    id: 5,
    centralQuestion: "How do you represent categories without inventing order, exploding memory, or failing on tomorrow’s unseen value?",
    objective: "Select nominal, ordinal, one-hot, frequency-aware, and learned representations; control high cardinality, unknown categories, interactions, and leakage.",
    sections: [
      {
        id: "semantics",
        title: "An encoding proposes a geometry",
        body: [
          "One-hot encoding assigns a binary dimension to each known category. It does not claim that Riyadh is closer to Jeddah than to Dammam; each category is equidistant in the raw indicator space. For low-cardinality nominal fields and linear models, that neutrality is valuable. One category is often omitted for an intercept-based linear model to avoid exact collinearity, while tree pipelines may retain all indicators.",
          "Ordinal encoding maps ordered labels to increasing codes. It is appropriate when the order is real and the model can tolerate or exploit the implied monotonic structure. Yet codes 0, 1, 2 do not prove that the move from bronze to silver equals silver to gold. A flexible tree can split the order without assuming linear spacing; a linear model reads the differences numerically unless transformed further.",
          "Unknown-category behavior must be designed. Rejecting a request may be safest for a tightly governed code set. Mapping to an explicit `OTHER` bucket can maintain service for open-world fields. Silently mapping an unseen clinical code to the most frequent category is rarely defensible because it asserts a false meaning."
        ],
        table: table("Categorical representation decisions", ["Representation", "Best fit", "Main trade-off", "Unknown value"], [
          ["One-hot", "Low/medium-cardinality nominal", "Wide sparse matrix", "Ignore or OTHER policy"],
          ["Ordinal", "True ordered categories", "Spacing/monotonic assumption", "Reserved unknown code"],
          ["Hashing", "Very high-cardinality streaming", "Collisions; reduced interpretability", "Naturally hashed"],
          ["Target encoding", "High-cardinality with signal", "Severe label leakage risk", "Smoothed global prior"],
          ["Learned embedding", "Large data and neural models", "Training complexity; drift", "Unknown token/vector"]
        ]),
        check: { question: "What hidden claim does integer-encoding a nominal city make to a linear model?", answer: "It claims ordered, equally spaced numerical effects among arbitrary codes." }
      },
      {
        id: "cardinality",
        title: "High cardinality turns memorization into a feature",
        body: [
          "A field with thousands of categories—merchant ID, product SKU, postal code—can create a huge sparse matrix. Rare levels have weak evidence; a model may memorize their training outcomes. Grouping low-frequency levels into `OTHER` reduces variance but may hide meaningful rare entities. Feature hashing bounds dimensionality while accepting collisions. Learned embeddings can share statistical strength through geometry, but require enough data and careful cold-start handling.",
          "Frequency encoding replaces a category with how often it appears. This may express popularity but loses identity: two categories with equal frequency become indistinguishable. Target encoding replaces categories with outcome estimates and can be powerful, but naïve computation uses each row’s own label. Leakage-safe target encoding needs out-of-fold estimates for training rows, smoothing for rare categories, and a mapping learned only from development data.",
          "Identifiers deserve suspicion. A stable vendor ID may encode legitimate historical performance, yet it can also memorize entities and fail on new vendors. Evaluate known and unseen-entity slices separately. If the intended claim is about vendor behavior, aggregate causally available history instead of treating an arbitrary identifier as magnitude."
        ],
        example: "A default model target-encodes employer name on the full training set. Employers with one applicant receive either 0% or 100% default rate, essentially revealing the row’s label. Cross-validation on the already encoded table remains optimistic. Out-of-fold encoding plus smoothing prevents each training row from voting on its own feature value.",
        failure: "Reducing cardinality by keeping only categories seen in both train and test consults the test distribution. Vocabulary decisions must be fitted on training evidence and applied to held-out data under a predeclared unknown policy.",
        check: { question: "Why is a frequency-encoded category not equivalent to the original category?", answer: "Frequency preserves prevalence but discards identity; categories with the same count collapse even if their outcome relationships differ." }
      },
      {
        id: "crosses",
        title: "Feature crosses express conditional meaning",
        body: [
          "A category’s meaning can depend on another feature. Device type may be ordinary in one channel and suspicious in another. A feature cross creates joint categories such as `mobile × branch` so a linear model can assign separate effects. Crosses are useful when domain knowledge points to interactions that the base model cannot represent.",
          "The cost is multiplicative cardinality. Two fields with 100 and 200 levels can yield up to 20,000 crosses, most rare. Regularization, minimum-support rules, hashing, or hierarchical models may be needed. The cross also changes deployment requirements: both upstream fields and their exact normalization rules become part of the contract.",
          "A preprocessing pipeline should fit category vocabularies, rare-level grouping, and any learned encoding inside each validation fold. The feature-name output should be inspectable so errors can be traced to source categories rather than anonymous matrix columns."
        ],
        code: code("python", "from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder, OrdinalEncoder\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\n\nprep = ColumnTransformer([\n    (\"nominal\", OneHotEncoder(handle_unknown=\"infrequent_if_exist\",\n                              min_frequency=20),\n     [\"channel\", \"device_family\"]),\n    (\"ordinal\", OrdinalEncoder(\n        categories=[[\"low\", \"medium\", \"high\"]],\n        handle_unknown=\"use_encoded_value\", unknown_value=-1),\n     [\"risk_band\"]),\n])\nmodel = Pipeline([(\"prep\", prep),\n                  (\"clf\", LogisticRegression(max_iter=1000))])", [
          "Rare nominal categories are pooled using a rule learned from training data.",
          "Unknown nominal and ordinal values have explicit behavior rather than crashing silently.",
          "The ordered vocabulary is written explicitly, avoiding alphabetical accident."
        ], "It prevents arbitrary ordinal order, uncontrolled feature explosion, and failures when production contains unseen categories."),
        check: { question: "What should be evaluated separately for a model using merchant identity?", answer: "Performance on merchants represented in training versus genuinely unseen merchants, because memorized entity history cannot help cold-start cases." }
      }
    ],
    glossary: [
      ["One-hot encoding", "Binary indicator representation with one dimension per learned category."],
      ["Ordinal encoding", "Ordered integer representation based on a declared category sequence."],
      ["Cardinality", "Number of distinct values in a categorical feature."],
      ["Feature hashing", "Mapping categories into a fixed number of buckets via a hash function."],
      ["Target encoding", "Replacing a category with an outcome statistic estimated from training labels."],
      ["Smoothing", "Shrinking weak category estimates toward a broader prior."],
      ["Feature cross", "A joint feature representing combinations of two or more inputs."],
      ["Cold start", "Prediction for an entity or category without historical observations."],
      ["Unknown policy", "Declared handling for categories absent during fitting."]
    ],
    exercise: {
      duration: 35,
      title: "Design a categorical pipeline for fraud screening",
      brief: "Features include channel (4 levels), risk band (ordered 3 levels), merchant ID (80,000 levels), and country (currently 42 levels).",
      parts: [
        "Classify semantics and choose a baseline encoding for each field.",
        "Define unknown-category and rare-category behavior.",
        "Design a cold-start evaluation for new merchants.",
        "Explain whether a `channel × country` cross is worth testing and how you would constrain it."
      ],
      solution: "One-hot channel and country with explicit infrequent/unknown handling; encode risk band in its declared order and verify whether the estimator assumes spacing. For merchant ID, begin with causally available merchant-history aggregates and an unseen flag; test hashing or leakage-safe target encoding only with smoothing and out-of-fold construction. Hold out a group of merchants entirely for cold-start evaluation. A channel-country cross is plausible for different fraud modes, but pool rare combinations, regularize, and compare incremental PR-AUC and operational burden."
    },
    sources: { core: ["googleCategorical","sklearnPreprocess","sklearnPipeline"], deep: ["sklearnCV","googleOverfit"] },
    quiz: [
      { concept:"Nominal encoding", prompt:"A linear model receives airport codes encoded alphabetically as 1–300. What is the primary defect?", answer:2, options:[
        ["The codes are too small.","Magnitude size is not the issue."],
        ["Linear models cannot accept integers.","They can; the semantics of these integers are wrong."],
        ["The model interprets arbitrary order and distance as meaningful.","Correct. Alphabetical codes create fabricated geometry."],
        ["Every airport becomes missing.","Integer encoding does not itself create missing values."]
      ]},
      { concept:"Ordinal encoding", prompt:"A model uses low, medium, high operational risk. Which implementation is most deliberate?", answer:1, options:[
        ["Let alphabetical order choose the codes.","Alphabetical order can contradict semantic order."],
        ["Declare the category order and test whether the model’s spacing assumption is acceptable.","Correct. Both order and estimator behavior are explicit."],
        ["Convert all values to the same category.","That removes the useful ordering."],
        ["Use the label mean computed on the test set.","That is target and test leakage."]
      ]},
      { concept:"High cardinality", prompt:"A one-hot merchant ID creates 500,000 columns and excellent training accuracy but weak new-merchant results. What likely happened?", answer:0, options:[
        ["The model memorized known merchants with little shared structure.","Correct. Identity indicators do not generalize to unseen entities."],
        ["One-hot encoding imposed alphabetical distance.","One-hot does not impose order."],
        ["The target became continuous.","Encoding does not change target type."],
        ["The GPU necessarily ran out of memory in production.","Resource issues are possible, but the evidence points to cold-start generalization."]
      ]},
      { concept:"Target encoding", prompt:"Why is target encoding on the full dataset before CV unsafe?", answer:3, options:[
        ["It makes every matrix dense.","Density is not the defining risk."],
        ["It cannot represent rare categories.","It can, but rare estimates are unstable."],
        ["It removes the labels.","Labels are used, not removed."],
        ["Validation outcomes influence the encoded training features, sometimes row by row.","Correct. Out-of-fold fitting is required."]
      ]},
      { concept:"Unknown categories", prompt:"A governed medical code field receives an unseen code. Which behavior is safest for a high-risk endpoint?", answer:2, options:[
        ["Map it silently to the most common diagnosis.","That asserts false clinical meaning."],
        ["Refit the encoder during the request.","Online refitting changes the model input space."],
        ["Reject or quarantine it according to a documented contract and alert the owner.","Correct. The unknown value may represent a schema change requiring review."],
        ["Convert it to a random known code.","Random substitution is unauditable and unsafe."]
      ]},
      { concept:"Feature crosses", prompt:"Crossing 1,000 products with 5,000 merchants produces mostly singletons. What is the main modeling risk?", answer:1, options:[
        ["The cross becomes ordinal.","A cross remains categorical unless separately encoded."],
        ["Sparse rare combinations enable memorization and unstable estimates.","Correct. Cardinality multiplies and evidence per cell collapses."],
        ["The feature can no longer leak.","High-cardinality crosses can leak or memorize identifiers."],
        ["The target distribution becomes uniform.","Feature construction does not guarantee target balance."]
      ]},
      { concept:"Frequency encoding", prompt:"Two device models each occur in 4% of training rows but have different failure rates. What information does frequency encoding lose?", answer:0, options:[
        ["Their distinct identities and outcome relationships.","Correct. Equal frequencies collapse to the same numeric value."],
        ["The training sample size.","The frequency itself reflects sample proportion."],
        ["The numerical scale of the label.","Label scale is independent of this encoding."],
        ["All ability to handle unknowns.","An unknown can receive a defined frequency, though identity remains lost."]
      ]}
    ]
  });

  register({
    id: 6,
    centralQuestion: "The validation score is excellent. Which future fact, duplicated entity, or global statistic secretly helped produce it?",
    objective: "Detect target, temporal, future-information, preprocessing, and split leakage; redesign feature timestamps and validation so reported performance represents a deployable decision.",
    sections: [
      {
        id: "leakage-model",
        title: "Leakage is illegal information flow",
        body: [
          "Feature leakage occurs when an input contains information unavailable or impermissible at actual prediction time. Target leakage is the sharpest form: a feature is a direct or indirect consequence of the outcome, such as a ‘claim approved’ code used to predict approval. Temporal leakage occurs when later observations enter earlier examples. Future-information leakage can be subtle: a monthly total computed at month end attached to decisions made on day three.",
          "The correct test is counterfactual and operational: freeze the clock at the prediction timestamp and ask whether the exact value, with the same quality and latency, would exist. A field present in today’s historical warehouse may not have been present at the past decision moment. The feature pipeline needs event time, availability time, and often processing time to distinguish when something happened from when the model could know it.",
          "Leakage can also arise through relationships. Records for one patient, device, or document cross train and validation; augmented versions of the same image land in different sets; future aggregates summarize an entity’s entire history. These violations make the held-out set familiar even if no label column is copied."
        ],
        table: table("Leakage diagnosis", ["Leakage type", "Example", "Why score rises", "Repair"], [
          ["Target", "Post-outcome resolution code", "Outcome is nearly encoded", "Remove; define decision-time contract"],
          ["Temporal", "Future readings in past window", "Model sees events after prediction", "Point-in-time join; chronological validation"],
          ["Preprocessing", "Scaler fitted before split", "Held-out distribution shapes training", "Pipeline fitted within folds"],
          ["Entity", "Same patient in train and test", "Identity-specific patterns repeat", "Group-aware split"],
          ["Augmentation", "Original and crop across splits", "Near-identical content repeats", "Split originals before augmentation"]
        ]),
        check: { question: "Why is a historical warehouse column not automatically a legal feature?", answer: "The warehouse shows what is known now; the model may need what was knowable at the past decision timestamp with production-equivalent latency." }
      },
      {
        id: "point-in-time",
        title: "Point-in-time correctness is a join property",
        body: [
          "Feature tables often store the latest state, while training needs the state as of each historical prediction. A correct point-in-time join chooses, for each example, the latest feature record whose availability time is no later than the example’s prediction time. Joining only by customer ID attaches current status to old decisions.",
          "Outcome windows must not overlap feature windows. If a churn label means no purchase in the next 30 days, a rolling 30-day purchase feature must end at prediction time, not label maturity. For labels delayed by claims settlement or manual review, examples near the dataset end may be immature and falsely appear negative. Apply an observation cutoff so every included label has had time to resolve.",
          "Time leakage can survive a chronological split when feature computation itself uses future rows. Validation design and feature generation must share the same cutoff semantics. A split is not a time machine if upstream aggregation ignored time."
        ],
        diagram: diagram("timeline", "Legal and illegal information around a decision", ["History window", "Prediction time", "Outcome window", "Label maturity"], [[0,1],[1,2],[2,3]], "Features stop at prediction time; the outcome is observed only after its window matures."),
        example: "A fraud feature ‘merchant chargeback rate’ was computed from all transactions in the year. For a January transaction it includes chargebacks recorded in November. The model appears to know risky merchants early because the aggregate was assembled with hindsight. Recompute each rate using only chargebacks available before each transaction.",
        failure: "Sorting by date before calling a random split does not create temporal validation; the randomizer still mixes future and past. Conversely, a chronological split alone does not repair future-looking aggregates.",
        check: { question: "Why exclude examples whose label window has not matured?", answer: "Their unresolved outcomes are systematically mislabeled as negative, introducing right-censoring and time-dependent label noise." }
      },
      {
        id: "preprocessing-selection",
        title: "Model selection can leak without touching a feature",
        body: [
          "Global imputation, scaling, feature selection, resampling, and target encoding leak when they are fitted before validation folds. Hyperparameter tuning on the test set is test contamination. Repeatedly consulting test results and modifying the system turns the test set into an informal validation set, even if nobody calls `.fit` on it.",
          "A clean protocol separates development from final evidence. Training folds fit every learned step. Validation selects features, algorithms, thresholds, and hyperparameters. A locked test set is used once for a final estimate after decisions are frozen. If major changes follow test inspection, obtain a new untouched evaluation set or clearly downgrade the claim.",
          "Synthetic oversampling must occur inside each training fold. If synthetic samples are created before splitting, a validation example can be surrounded by descendants of itself. The apparent benefit is not class-balancing skill but family resemblance across the boundary."
        ],
        code: code("python", "from sklearn.model_selection import GroupKFold, cross_validate\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\n\npipe = Pipeline([\n    (\"impute\", SimpleImputer(strategy=\"median\")),\n    (\"scale\", StandardScaler()),\n    (\"model\", LogisticRegression(class_weight=\"balanced\", max_iter=1000))\n])\ncv = GroupKFold(n_splits=5)\nresult = cross_validate(pipe, X, y, groups=customer_id, cv=cv,\n                        scoring=[\"average_precision\", \"recall\"])\nprint(result[\"test_average_precision\"].mean())", [
          "`GroupKFold` prevents the same customer from appearing in both sides of a fold.",
          "The pipeline refits imputation and scaling on each training partition.",
          "Average precision and recall describe an imbalanced problem better than accuracy alone."
        ], "It closes both entity and preprocessing leakage paths during model selection."),
        check: { question: "When does the test set stop being a test set?", answer: "When its results influence model, feature, threshold, or preprocessing decisions; it has then become part of development feedback." }
      },
      {
        id: "diagnosis",
        title: "Leakage leaves operational fingerprints",
        body: [
          "Suspiciously high performance, a sharp fall after deployment, features recorded after outcomes, near-perfect single-feature importance, and large gaps between random and temporal or group-aware validation all deserve investigation. None proves leakage; genuinely predictive systems exist. The response is a lineage audit, feature-availability review, split-neighbor search, and ablation of suspect fields.",
          "Trace a few predictions end to end. Reconstruct what raw records existed at the historical timestamp, compare offline and online feature values, and test whether identifiers or post-decision workflow fields dominate. Leakage investigation is strongest when it names the information path and demonstrates the score change after closing it."
        ],
        consequence: "Leakage produces a model that solves a retrospective reconstruction problem while the product needs a prospective prediction. Deployment performance collapses because the shortcut vanishes—not because production is mysteriously harder.",
        check: { question: "What is stronger evidence than simply deleting a suspicious field?", answer: "Demonstrating its availability path, rebuilding point-in-time features, and showing how honest validation changes across time and entity splits." }
      }
    ],
    glossary: [
      ["Feature leakage", "Use of information unavailable or impermissible at prediction time."],
      ["Target leakage", "A feature directly or indirectly reveals the outcome."],
      ["Temporal leakage", "Future observations influence an earlier prediction example."],
      ["Point-in-time join", "Join constrained to information available by each example’s prediction time."],
      ["Label maturity", "Time by which the outcome window and reporting delay have completed."],
      ["Test contamination", "Using test results to make development choices."],
      ["Entity leakage", "Related records from one entity cross evaluation boundaries."],
      ["Availability time", "When information became usable by the prediction system."],
      ["Ablation", "Removing a component or feature to measure its contribution."]
    ],
    exercise: {
      duration: 85,
      title: "Leakage red-team for a fraud pipeline",
      brief: "A fraud model has ROC-AUC 0.995 offline and 0.71 after launch. Available fields include dispute status, investigation queue, annual merchant chargeback rate, device history, and transaction metadata.",
      parts: [
        "Create a prediction-time availability table for every field.",
        "Audit point-in-time joins and label maturity for January–June examples.",
        "Compare random, chronological, and merchant-grouped validation.",
        "Move preprocessing and resampling inside folds; run ablations of post-event fields.",
        "Write a short release decision identifying which score is credible and why."
      ],
      solution: "Dispute status and investigation queue are likely post-outcome or post-decision workflow leakage. Annual chargeback rate must be recomputed as of each transaction. Device history must stop at the transaction timestamp. Exclude immature labels near the cutoff. Use a temporal holdout plus a merchant-group stress test if new merchants matter. Fit encoders, scaling, and any resampling only on training partitions. The credible score is the one produced by production-equivalent, point-in-time features under the split matching deployment; the 0.995 result should not be cited after its information paths fail audit."
    },
    sources: { core: ["sklearnPipeline","sklearnCV","googleOverfit"], deep: ["sklearnMetrics","googleML"] },
    quiz: [
      { concept:"Target leakage", prompt:"A loan-default model includes `collections_case_opened`, which is created only after missed payments. Why is offline performance misleading?", answer:0, options:[
        ["The feature is a downstream consequence of the target process.","Correct. It reveals information unavailable when the loan decision is made."],
        ["The feature is categorical.","Categorical type is not the defect."],
        ["Collections data is always MNAR.","Missingness is not the main issue."],
        ["The model needs more regularization.","Regularization cannot legalize post-outcome information."]
      ]},
      { concept:"Point-in-time joins", prompt:"Historical customer snapshots are joined to the current loyalty tier by customer ID. What repair is required?", answer:2, options:[
        ["Standardize loyalty tier.","Scaling cannot restore historical state."],
        ["Randomize row order before joining.","Order does not constrain information time."],
        ["Join the latest tier record available at or before each prediction timestamp.","Correct. This reconstructs knowable historical state."],
        ["Use the test tier for validation only.","Held-out future state remains leakage."]
      ]},
      { concept:"Label maturity", prompt:"A 30-day readmission label is built for discharges through 31 December using data extracted 5 January. What is wrong with late-December examples?", answer:1, options:[
        ["They have too many features.","The issue is incomplete outcome observation."],
        ["Their outcome windows have not matured and negatives may be false.","Correct. They are right-censored."],
        ["They require one-hot encoding.","Encoding does not fix unresolved labels."],
        ["They must be MCAR.","Censoring is systematic by time."]
      ]},
      { concept:"Preprocessing leakage", prompt:"Feature selection uses correlation with the label on all development rows before CV. What is the result?", answer:3, options:[
        ["Only training becomes slower.","The primary effect is optimistic selection bias."],
        ["The labels become calibrated.","Selection does not calibrate probabilities."],
        ["Group leakage is automatically prevented.","Feature selection is unrelated to grouping."],
        ["Each validation fold helped choose the features evaluated on it.","Correct. Selection must occur within the fold pipeline."],
      ]},
      { concept:"Resampling leakage", prompt:"SMOTE is run before the dataset is split. Why can validation be optimistic?", answer:0, options:[
        ["Synthetic training points can be derived from validation-neighbor information.","Correct. Related samples straddle the boundary."],
        ["SMOTE always lowers recall.","Its effect varies; leakage is the concern here."],
        ["The majority class disappears by definition.","SMOTE adds minority samples; it does not necessarily remove majority samples."],
        ["ROC-AUC cannot be computed after SMOTE.","AUC remains computable on an untouched validation set."]
      ]},
      { concept:"Test contamination", prompt:"After every feature change, a team checks the locked test score and keeps improvements. After 40 rounds, what is the test set?", answer:2, options:[
        ["Still untouched because it was never used in `.fit`.","Decision feedback itself contaminates the estimate."],
        ["A training set with labels removed.","It was not directly optimized by gradient fitting."],
        ["An informal validation set that has influenced selection.","Correct. A fresh test is needed for an unbiased final claim."],
        ["A calibration set by definition.","Calibration is a specific fitting purpose, not any repeated evaluation."]
      ]},
      { concept:"Temporal validation", prompt:"A team sorts records by time and then calls a random 80/20 split. Does sorting solve future leakage?", answer:1, options:[
        ["Yes, because early rows remain first.","Random assignment ignores sorted position."],
        ["No; the random split still mixes later observations into training.","Correct. Use a chronological boundary or rolling validation."],
        ["Yes, if the model is linear.","Estimator type does not fix the split."],
        ["No, because time can never be validated.","Time-aware holdouts and backtests are standard solutions."]
      ]},
      { concept:"Leakage diagnosis", prompt:"One feature alone gives near-perfect validation accuracy, but its source system updates a day after the decision. What is the best next step?", answer:3, options:[
        ["Deploy immediately because single-feature models are interpretable.","Interpretability does not make unavailable information usable."],
        ["Increase its weight.","That intensifies dependence on the suspect shortcut."],
        ["Hide the feature name from reviewers.","That destroys governance and does not fix leakage."],
        ["Audit availability timestamps and rerun an ablation with point-in-time reconstruction.","Correct. This tests the suspected information path."],
      ]},
      { concept:"Entity leakage", prompt:"Different scans from the same patient are split across training and validation. Which design better estimates new-patient performance?", answer:0, options:[
        ["Group all scans from one patient in the same partition.","Correct. The evaluation unit becomes genuinely unseen patients."],
        ["Shuffle pixels within each image.","This destroys the signal and does not fix identity overlap."],
        ["Use more epochs.","Training duration cannot restore independence."],
        ["Standardize using the validation images.","That adds preprocessing leakage."]
      ]},
      { concept:"Augmentation leakage", prompt:"An original image is in validation while its rotated copies are in training. What is the core problem?", answer:2, options:[
        ["Rotation makes labels ordinal.","The label semantics are unchanged."],
        ["Validation becomes too large.","Size is not the central issue."],
        ["Near-identical content crosses the boundary, overstating generalization.","Correct. Split originals first, then augment training only."],
        ["The model cannot learn rotation invariance.","It may learn it, but the evaluation is contaminated."]
      ]}
    ]
  });

  // Sessions 7–12 are appended below to keep the file readable during review.
})();

(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 7,
    centralQuestion: "If production contains new people, later months, and changing prevalence, which split is an honest rehearsal?",
    objective: "Design training, validation, test, group, and chronological partitions that match the intended generalization claim; recognize IID and stationarity assumptions, validation overuse, and distribution mismatch.",
    sections: [
      {
        id: "roles",
        title: "Each partition answers a different question",
        body: [
          "The training set estimates model parameters. The validation set or cross-validation folds guide algorithm, feature, hyperparameter, and threshold choices. The test set estimates performance after those choices are frozen. These are information roles, not merely percentages. A 70/15/15 split is not automatically sound; independence, population coverage, label maturity, and sample size matter more than a familiar ratio.",
          "Validation overuse occurs when many experiments are compared against the same holdout. Even without intentional cheating, the team adapts to its noise. Test contamination is stronger: test feedback changes development choices. The remedy is process discipline, nested validation for intensive tuning, and a new untouched evaluation sample when the original test has influenced decisions.",
          "Duplicates and related observations must remain together. Multiple claims from one policyholder, windows from one machine, or images from one patient violate row-level independence. A group-based split estimates performance on unseen groups; a within-group future split answers a different question—future events for known groups. State the claim before choosing the split."
        ],
        diagram: diagram("split", "Information roles in model development", ["Training", "Validation", "Frozen choices", "Test", "Production"], [[0,1],[1,2],[2,3],[3,4]], "Test evidence is credible only when it did not steer the frozen choices."),
        check: { question: "Why is the best split not determined by a standard percentage?", answer: "Because the split must preserve the independence, time, group, and distribution structure relevant to deployment; percentages only allocate sample size." }
      },
      {
        id: "iid-time",
        title: "IID and stationarity are claims about transfer",
        body: [
          "Random splitting approximates independent and identically distributed sampling: train and evaluation examples are exchangeable draws from the same stable distribution. That can be reasonable for a mature process with independent observations. It is misleading when tomorrow differs from yesterday, entities repeat, or data was collected in batches with site-specific effects.",
          "Stationarity means relevant statistical relationships remain sufficiently stable over time. A chronological split directly tests transfer from past to later data; rolling-origin validation repeats that test across several cutoffs. Time-series folds must train only on earlier windows. If seasonality matters, the validation horizon should cover it, and gaps may be required when features or labels span time across the boundary.",
          "Distribution mismatch is not automatically an error. A deliberately shifted test—new hospitals, devices, or geographies—can be a stress test. It simply answers a different question from in-distribution performance. Expert reporting labels each set by its population and purpose instead of averaging unlike conditions into one score."
        ],
        table: table("Split choice by deployment claim", ["Deployment claim", "Split design", "Protects against", "Does not prove"], [
          ["New rows from same stable population", "Random or stratified", "Chance imbalance", "Future stability"],
          ["New entities", "Group-aware", "Identity memorization", "Within-entity temporal transfer"],
          ["Future period", "Chronological / rolling", "Future-to-past leakage", "New-entity generalization"],
          ["New site or region", "Site holdout", "Site-specific shortcuts", "Average in-site performance"]
        ]),
        failure: "Stratification preserves class proportions; it does not make dependent observations independent. Stratified row-level folds can still leak the same patient across train and validation.",
        check: { question: "When would a gap between training and validation periods be necessary?", answer: "When feature lookback or label outcome windows can cross the boundary, so a gap prevents adjacent records from sharing information." }
      },
      {
        id: "cv",
        title: "Cross-validation repeats a deployment simulation",
        body: [
          "K-fold cross-validation partitions development data into K folds, trains K times, and evaluates each fold once. Its mean estimates typical performance under the fold-generating process; its variation reveals sensitivity to the sampled partition. Stratified K-fold preserves approximate class ratios, especially useful when positives are scarce. Group K-fold keeps entities intact. Time-series validation preserves ordering and often expands the training window.",
          "Every learned preprocessing operation must be fitted inside each training fold. When hyperparameters are searched extensively and a less biased estimate is needed, nested cross-validation uses an inner loop for selection and an outer loop for estimation. It costs more because every outer fold contains its own search.",
          "After selection, refit the entire pipeline on all allowed development data and evaluate once on the locked test. The test score should be accompanied by slice results and uncertainty; a single decimal without the sampling design overstates what was learned."
        ],
        code: code("python", "from sklearn.model_selection import StratifiedGroupKFold, cross_validate\nfrom sklearn.metrics import make_scorer, average_precision_score\n\ncv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)\nresults = cross_validate(\n    estimator=pipeline, X=X, y=y, groups=patient_id, cv=cv,\n    scoring={\"ap\": \"average_precision\", \"roc\": \"roc_auc\"},\n    return_train_score=True\n)\nprint(results[\"test_ap\"].mean(), results[\"test_ap\"].std())", [
          "Stratification manages fold prevalence while grouping keeps each patient on one side.",
          "The pipeline—not a preprocessed matrix—is passed to validation.",
          "Reporting fold spread reveals instability hidden by the mean."
        ], "It prevents identity overlap and learned preprocessing leakage while making low-prevalence folds usable."),
        check: { question: "What does a wide cross-validation score spread suggest?", answer: "The estimate is sensitive to which groups or cases are held out; investigate sample size, heterogeneity, leakage, and slice composition before trusting the mean." }
      }
    ],
    glossary: [
      ["Training set", "Partition used to fit learned parameters."],
      ["Validation set", "Evidence used to select models, features, thresholds, or hyperparameters."],
      ["Test set", "Locked partition used after development choices are frozen."],
      ["IID", "Assumption that examples are independent draws from the same distribution."],
      ["Stationarity", "Sufficient stability of relevant distributions or relationships over time."],
      ["Stratification", "Partitioning that approximately preserves label proportions."],
      ["Group-aware split", "Partitioning that keeps all rows from one entity together."],
      ["Rolling-origin validation", "Repeated time validation with successively later cutoffs."],
      ["Nested cross-validation", "Outer estimation folds containing inner model-selection folds."]
    ],
    exercise: {
      duration: 40,
      title: "Design three honest claims from one healthcare dataset",
      brief: "The data contains repeated visits per patient across four hospitals and three years.",
      parts: [
        "Design a split to estimate new visits for known patients.",
        "Design a split to estimate performance on unseen patients in known hospitals.",
        "Design a stress test for a new hospital next year.",
        "For each, state which claim it supports, which leakage it blocks, and which uncertainty remains."
      ],
      solution: "For known patients, use a chronological within-patient design where earlier visits train and later visits evaluate, with outcome-window gaps. For unseen patients, group by patient and stratify outcomes if feasible. For a new-hospital-next-year stress test, hold out the newest period from one entire hospital; report it separately because site and time shift are confounded. Fit all preprocessing within partitions and keep a final untouched period/site combination if enough data exists."
    },
    sources: { core: ["sklearnCV","googleOverfit","sklearnPipeline"], deep: ["sklearnMetrics","googleML"] },
    quiz: [
      { concept:"Group split", prompt:"A warranty model has 40 weekly rows per machine. Production predicts for newly installed machines. Which split best matches the claim?", answer:1, options:[
        ["Randomly split weekly rows.","The same machine appears on both sides, allowing identity and history shortcuts."],
        ["Hold out complete machines as groups.","Correct. Evaluation machines are genuinely unseen."],
        ["Stratify only by failure label.","Label balance does not prevent machine overlap."],
        ["Use the last column as test data.","Columns are features, not temporal examples."]
      ]},
      { concept:"Chronological split", prompt:"A demand model will forecast next quarter under seasonal patterns. Why prefer rolling-origin validation?", answer:2, options:[
        ["It guarantees the future distribution is unchanged.","No validation method guarantees stationarity."],
        ["It gives every row to training simultaneously.","Each origin preserves earlier training and later evaluation."],
        ["It tests several past-to-future transfers rather than mixing time randomly.","Correct. It exposes performance variation across cutoffs."],
        ["It removes the need for a label window.","Labels still need maturity and timing rules."]
      ]},
      { concept:"Validation overuse", prompt:"A team tries 2,000 pipelines on one validation set and selects the maximum score. What risk grows?", answer:0, options:[
        ["Adaptation to random quirks of that validation sample.","Correct. Multiple comparisons make the chosen score optimistic."],
        ["The training rows become unlabeled.","Repeated validation does not remove labels."],
        ["The estimator becomes unsupervised.","Learning type is unchanged."],
        ["The test set automatically expands.","Partition sizes do not change."]
      ]},
      { concept:"Test contamination", prompt:"A test result caused the team to add a new interaction and retune the threshold. What should happen before a final claim?", answer:3, options:[
        ["Rename the test set and keep its score.","A label change does not restore independence."],
        ["Average training and test scores.","That produces no valid estimate."],
        ["Delete the interaction.","The history of adaptation still affected development."],
        ["Use a fresh untouched evaluation set or disclose that the old test became validation.","Correct. New independent evidence is needed for a clean estimate."],
      ]},
      { concept:"Stratification", prompt:"With 0.2% positives, one random fold contains no positives. What does stratification primarily improve?", answer:2, options:[
        ["It prevents preprocessing leakage.","Only a pipeline fit boundary does that."],
        ["It proves calibration.","Class-balanced folds do not establish probability calibration."],
        ["It distributes scarce positives more consistently across folds.","Correct. Metrics become calculable and less composition-driven."],
        ["It makes rows independent.","Dependence must be handled by grouping or time structure."]
      ]},
      { concept:"Distribution mismatch", prompt:"A site-held-out score is lower than random CV. Which conclusion is strongest?", answer:1, options:[
        ["The site holdout is invalid because scores should match.","Different splits answer different transfer questions."],
        ["Site-specific variation matters; report the two claims separately.","Correct. The gap is evidence of a harder cross-site generalization problem."],
        ["The model must be overfitting labels only.","Other site, workflow, and population shifts may explain the gap."],
        ["Average both scores into one official score.","Averaging obscures the different populations."]
      ]},
      { concept:"Preprocessing in folds", prompt:"During five-fold CV, a vocabulary is built from all text before splitting. Why is this a breach?", answer:0, options:[
        ["Held-out document distribution influenced the representation available to training.","Correct. Vocabulary selection is a learned preprocessing step."],
        ["Text can never use cross-validation.","Text pipelines can be validated when fit boundaries are correct."],
        ["Five folds are incompatible with sparse matrices.","Sparse matrices are supported."],
        ["Vocabulary size is a business KPI.","It is a preprocessing parameter, not a KPI."]
      ]}
    ]
  });

  register({
    id: 8,
    centralQuestion: "Training error is low and validation error is high. Is the model too powerful—or is the evidence misleading?",
    objective: "Use bias, variance, learning curves, and validation curves to distinguish underfitting, overfitting, data limitation, distribution shift, and evaluation defects.",
    sections: [
      {
        id: "generalization",
        title: "Generalization is performance on the intended unseen distribution",
        body: [
          "A model generalizes when patterns learned from development data transfer to new cases drawn from the population and process named in the claim. Training fit is necessary but not sufficient. Underfitting occurs when the representation, model capacity, features, or optimization cannot capture useful structure: both training and validation performance remain poor. Overfitting occurs when the model captures training-specific noise or shortcuts: training performance is strong while held-out performance is materially worse.",
          "Bias and variance are reasoning tools. High bias describes systematic error from restrictive assumptions or insufficient learning. High variance describes sensitivity to the particular training sample. Increasing complexity often reduces training bias and increases variance, but real pipelines also contain label noise, leakage, shift, and optimization failures. Do not diagnose solely from the word ‘complex.’",
          "Model complexity is effective flexibility, not parameter count alone. Tree depth, leaf size, polynomial degree, neighbor count, network width, training duration, regularization, and feature dimensionality all change what functions the model can express or memorize."
        ],
        table: table("Diagnostic patterns", ["Observed pattern", "Leading hypothesis", "Useful next test", "Common misread"], [
          ["Train poor; validation poor", "Underfit or optimization/data signal problem", "Increase capacity; verify features/loss", "Add more of same data blindly"],
          ["Train strong; validation poor", "Variance, leakage, or shift", "Learning curve; simpler model; split audit", "Assume regularization alone fixes it"],
          ["Both strong; production poor", "Shift, skew, leakage, or monitoring gap", "Point-in-time replay; slice comparison", "Call it ordinary overfit"],
          ["Fold scores highly variable", "Small/heterogeneous groups", "Inspect fold composition", "Trust mean only"]
        ]),
        check: { question: "Can high validation error with low training error prove overfitting?", answer: "It is consistent with overfitting, but split mismatch, leakage in training-only features, label differences, or a tiny unstable validation set must also be examined." }
      },
      {
        id: "curves",
        title: "Learning curves ask whether additional examples change the gap",
        body: [
          "A learning curve plots training and validation performance against training-set size. With high variance, training performance often declines slightly while validation improves as more examples constrain memorization; a persistent gap may narrow. With high bias, both curves converge at weak performance, so more examples of the same kind offer little benefit until representation, features, optimization, or model capacity changes.",
          "A validation curve varies one complexity-controlling hyperparameter. For tree depth, training performance typically improves monotonically; validation may rise then fall. The peak suggests a trade-off under the chosen split and metric, not a universal depth. If the curve changes drastically across time or groups, one global setting may hide heterogeneity.",
          "Curves must be constructed with the complete leakage-safe pipeline. Otherwise the apparent benefit of more data may partly reflect preprocessing fitted on the full dataset. Include uncertainty bands or fold points; a smooth mean line can conceal unstable subpopulations."
        ],
        example: "A text classifier has 99% training F1 and 76% validation F1. Adding data raises validation to 84% while training falls to 96%, and the gap continues narrowing. This is consistent with variance reduction. If both stayed near 76%, investigate representation, label ceiling, or model bias rather than purchasing identical data immediately.",
        failure: "Calling a model ‘underfit’ because its absolute score seems low ignores label noise and irreducible ambiguity. Compare to simple baselines, human agreement, slice difficulty, and learning behavior before prescribing capacity.",
        check: { question: "What does convergence of train and validation curves at a poor score suggest?", answer: "A bias or information ceiling: more same-distribution examples alone are unlikely to solve it; improve features, representation, model, optimization, or labels." }
      },
      {
        id: "baselines-errors",
        title: "Error analysis turns a gap into a repair hypothesis",
        body: [
          "Begin with a baseline: mean prediction for regression, prevalence-aware or simple linear rules for classification, and an operational incumbent. A complex model that barely beats a robust baseline may not justify added risk. Then sample false positives, false negatives, and high-residual cases by meaningful slices. Categorize failure mechanisms—ambiguous labels, missing context, rare subgroup, distribution shift, or data pipeline defect.",
          "Change one cause at a time. If errors cluster in unseen devices, more random examples will dilute rather than solve the gap; obtain that device data or redesign the representation. If performance saturates at annotator disagreement, relabeling protocol may matter more than depth. If only training improves as capacity rises, regularization or simpler features are indicated.",
          "The downstream engineering consequence is prioritization. Learning curves estimate value from more data; validation curves estimate value from complexity; slice error analysis identifies which data or feature change is likely to move the operational metric."
        ],
        code: code("python", "from sklearn.model_selection import learning_curve\nimport numpy as np\n\nsizes, train, valid = learning_curve(\n    estimator=pipeline, X=X, y=y, cv=group_cv, groups=entity_id,\n    scoring=\"average_precision\",\n    train_sizes=np.linspace(0.2, 1.0, 5), n_jobs=-1\n)\nsummary = {\n    \"sizes\": sizes.tolist(),\n    \"train_mean\": train.mean(axis=1).tolist(),\n    \"valid_mean\": valid.mean(axis=1).tolist(),\n    \"valid_sd\": valid.std(axis=1).tolist()\n}", [
          "The production-aligned group split is reused at every training size.",
          "Training and validation curves are compared rather than reporting validation alone.",
          "Fold standard deviation keeps uncertainty visible."
        ], "It prevents a misleading random-row learning curve from diagnosing a group-generalization problem."),
        check: { question: "Why compare against an operational baseline rather than only a statistical dummy?", answer: "Deployment replaces or augments an existing process; incremental value and risk are relative to that real alternative." }
      }
    ],
    glossary: [
      ["Generalization", "Transfer of learned behavior to the explicitly intended unseen distribution."],
      ["Underfitting", "Failure to capture useful structure in both training and held-out data."],
      ["Overfitting", "Learning training-specific noise or shortcuts that do not transfer."],
      ["Bias", "Systematic error from assumptions, representation, or insufficient fit."],
      ["Variance", "Sensitivity of the fitted model to the particular training sample."],
      ["Learning curve", "Train and validation performance plotted against training size."],
      ["Validation curve", "Performance plotted against a complexity-controlling setting."],
      ["Baseline", "Simple or incumbent reference against which value is judged."],
      ["Irreducible error", "Uncertainty not removable with the available predictors and target definition."]
    ],
    exercise: {
      duration: 35,
      title: "Diagnose four curve patterns",
      brief: "You receive train/validation scores by sample size for churn, fraud, image defects, and demand forecasting.",
      parts: [
        "Classify each pattern as leading evidence for bias, variance, shift, or instability.",
        "Name one alternative explanation that the curve alone cannot exclude.",
        "Choose the next experiment: more data, better labels, new features, regularization, or split redesign.",
        "Write the expected downstream curve change if your diagnosis is right."
      ],
      solution: "A wide narrowing gap suggests variance and potential value from more representative data or regularization. Converged weak curves suggest bias, feature limits, label noise, or optimization. Strong offline curves with weak later-period performance suggest shift, skew, or leakage. Jagged fold behavior suggests heterogeneous groups or insufficient positives. Every recommendation should predict a measurable change; for example, stronger regularization should worsen train fit but improve or stabilize held-out performance if variance is the cause."
    },
    sources: { core: ["googleOverfit","sklearnCV"], deep: ["sklearnMetrics","googleML"] },
    quiz: [
      { concept:"Underfitting", prompt:"Training and validation PR-AUC are both low and nearly equal across dataset sizes. What is the best next diagnostic?", answer:2, options:[
        ["Assume more identical rows will close a nonexistent gap.","Converged curves suggest that volume alone may have limited value."],
        ["Increase the test score by tuning on test.","That contaminates evidence."],
        ["Check feature signal, label quality, optimization, and model capacity.","Correct. Several bias or information ceilings can produce this pattern."],
        ["Delete the validation set.","Removing evaluation does not improve learning."]
      ]},
      { concept:"Variance", prompt:"A tree has 100% training accuracy, 71% validation accuracy, and improves to 80% as representative data grows. Which diagnosis leads?", answer:0, options:[
        ["High variance that additional data is reducing.","Correct. The narrowing train-validation gap supports this interpretation."],
        ["Guaranteed label leakage.","Leakage is possible but not established by this pattern."],
        ["High bias only.","Training fit is too strong for a pure high-bias diagnosis."],
        ["Perfect calibration.","Accuracy curves say nothing directly about probability calibration."]
      ]},
      { concept:"Validation curves", prompt:"As tree depth rises, training score increases continuously while validation peaks then falls. What does the falling region indicate?", answer:3, options:[
        ["The labels became missing.","Depth does not change label availability."],
        ["The model is becoming more biased.","Higher depth usually reduces fit bias."],
        ["The test set is larger.","Partition size is fixed."],
        ["Additional complexity is fitting training-specific variation.","Correct. Variance dominates beyond the validation optimum."],
      ]},
      { concept:"Learning curves", prompt:"Why must preprocessing remain inside the pipeline when generating learning curves?", answer:1, options:[
        ["Otherwise the x-axis becomes categorical.","Training size remains numerical."],
        ["Each size and fold must learn transformations only from its training subset.","Correct. Global preprocessing leaks and changes the apparent data-size effect."],
        ["Pipelines guarantee monotonic validation scores.","Scores can move non-monotonically."],
        ["Pipelines remove irreducible error.","They structure fitting; they cannot remove inherent uncertainty."]
      ]},
      { concept:"Distribution shift", prompt:"Offline test performance is excellent, but a new device model performs poorly. Train and test used only old devices. What was missing?", answer:0, options:[
        ["A deployment-relevant device slice or shifted holdout.","Correct. The original test did not support the new-device claim."],
        ["A lower training loss.","Old-device fit cannot establish new-device transfer."],
        ["More decimal places in the metric.","Precision of reporting cannot replace relevant evidence."],
        ["An exact duplicate in each split.","That would worsen evaluation integrity."]
      ]},
      { concept:"Baseline", prompt:"A complex model improves RMSE 0.2% over the current seasonal rule but triples latency and operating cost. What should the engineer conclude?", answer:2, options:[
        ["Any lower RMSE mandates deployment.","Technical improvement must be weighed against business value and operational cost."],
        ["Latency never matters for forecasting.","Forecasts still have deadlines and resource constraints."],
        ["Compare the incremental benefit with uncertainty, decision impact, and total cost.","Correct. The incumbent is the relevant alternative."],
        ["Remove the baseline from the report.","That hides the decision context."]
      ]},
      { concept:"Error analysis", prompt:"False negatives cluster in one newly added language. Which next action is most targeted?", answer:1, options:[
        ["Add random examples from the dominant language.","That may dilute the problem."],
        ["Audit labels/tokenization and collect representative examples for the affected language.","Correct. The error slice points to a specific data and representation hypothesis."],
        ["Average all language metrics.","Aggregation hides the failure."],
        ["Increase every threshold equally without analysis.","Threshold changes trade errors but do not repair missing language signal."]
      ]}
    ]
  });

  register({
    id: 9,
    centralQuestion: "When a model memorizes noise, should you shrink parameters, simplify structure, stop earlier, or collect different evidence?",
    objective: "Explain L1, L2, regularization strength, early stopping, and model-specific complexity controls; predict how each changes bias, variance, sparsity, and optimization.",
    sections: [
      {
        id: "penalties",
        title: "Regularization changes the objective, not just the model size",
        body: [
          "Empirical loss rewards fit to training data. Regularization adds a preference for solutions expected to transfer. L2 adds a penalty proportional to the sum of squared weights. Large coefficients are disproportionately expensive, so correlated signal tends to be spread and weights shrink smoothly. L1 adds the sum of absolute weights. Its constant pull can drive some coefficients exactly to zero, producing sparsity when features are scaled comparably.",
          "Regularization strength controls the trade. Stronger penalties usually worsen training fit, raise bias, and reduce variance. But the exact effect depends on data, scale, optimizer, and parameterization. In scikit-learn logistic regression, smaller `C` means stronger regularization; in many objectives, larger lambda means stronger regularization. Certification scenarios often test the direction rather than the symbol.",
          "Scaling is part of fairness. Without it, a feature measured in small units may require a large coefficient and receive a larger penalty for the same predictive effect. A pipeline must learn scale inside folds before applying L1 or L2."
        ],
        table: table("L1 and L2 under pressure", ["Property", "L1", "L2"], [
          ["Penalty", "Sum of absolute weights", "Sum of squared weights"],
          ["Coefficient effect", "Can set weights exactly to zero", "Smooth shrinkage, rarely exact zero"],
          ["Correlated features", "May select one unstably", "Often shares weight"],
          ["Primary use", "Sparse solution / feature selection", "Stable shrinkage / variance control"],
          ["Scale sensitivity", "High", "High"]
        ]),
        check: { question: "Why can L1 select different features across folds when predictors are strongly correlated?", answer: "Several predictors explain similar signal; L1 can choose one sparse representative, and small sample changes can switch which one is cheapest." }
      },
      {
        id: "structural-controls",
        title: "Every model family exposes its own capacity knobs",
        body: [
          "Tree depth, minimum samples per leaf, and pruning constrain how finely a tree partitions data. Shallower trees or larger leaves prevent rules supported by only a handful of examples. In k-nearest neighbors, small k creates flexible local boundaries and high variance; larger k smooths across more neighbors, increasing bias. Polynomial degree, number of basis functions, and kernel bandwidth likewise control effective complexity.",
          "For neural networks, weight decay implements a form of L2-like parameter shrinkage, dropout injects stochastic omission during training, and early stopping limits how long the network adapts to training detail. Batch normalization primarily stabilizes and accelerates optimization through batch statistics; any regularizing side effect is context-dependent and should not be treated as its sole purpose.",
          "Feature dimensionality is another capacity control. A million sparse crosses allow a linear model to memorize rare combinations. Regularizing coefficients helps, but revisiting feature semantics and minimum support can be more effective than paying a penalty on a fundamentally brittle representation."
        ],
        example: "A decision tree isolates three fraudulent training transactions in depth-18 leaves and performs poorly on future months. Raising minimum leaf size removes those tiny rules; training recall drops, but future precision improves. The causal story is not ‘shallower is better’: the new constraint requires each rule to be supported by more evidence.",
        failure: "Selecting regularization using training loss defeats its purpose: the weakest penalty almost always fits training best. Choose it on leakage-safe validation aligned with the production metric and examine stability across folds and slices.",
        check: { question: "How does increasing k in k-nearest neighbors usually change the decision boundary?", answer: "It averages over a wider neighborhood, smoothing local fluctuations, typically raising bias and lowering variance." }
      },
      {
        id: "early-stopping",
        title: "Early stopping uses validation evidence as a complexity budget",
        body: [
          "During iterative training, models often learn broad signal before fitting smaller idiosyncrasies. Early stopping monitors a validation metric and preserves the checkpoint from the best observed epoch after a patience rule. It is a regularizer because training duration controls effective fit.",
          "The monitored data is now part of model selection, so it is not the final test. The checkpoint, epoch, preprocessing state, and metric direction must be recorded. A noisy validation curve can stop too soon; patience, minimum improvement, smoothing, or repeated seeds can help. After selection, some workflows retrain for the chosen number of epochs on more development data, while others deploy the best checkpoint; either choice must be explicit.",
          "Regularization does not compensate for leakage or distribution mismatch. If a future-derived feature dominates, shrinking its coefficient may reduce but not legalize the information path. Fix the data boundary first."
        ],
        code: code("python", "from sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import GridSearchCV\n\nsearch = GridSearchCV(\n    estimator=pipeline.set_params(model=LogisticRegression(\n        penalty=\"elasticnet\", solver=\"saga\", max_iter=3000)),\n    param_grid={\n        \"model__C\": [0.01, 0.1, 1, 10],\n        \"model__l1_ratio\": [0.0, 0.5, 1.0]\n    },\n    scoring=\"average_precision\", cv=group_cv, refit=True\n)\nsearch.fit(X_dev, y_dev, groups=entity_id)", [
          "`C` is searched on a logarithmic scale; smaller values impose stronger shrinkage.",
          "`l1_ratio` moves from L2 through elastic net to L1 behavior.",
          "The complete pipeline and group-aware folds keep preprocessing and entities inside the correct boundary."
        ], "It prevents selecting sparsity from training fit or from an entity-contaminated validation design."),
        check: { question: "Why can the early-stopping validation set not also be an untouched final test?", answer: "Its metric determined the stopping epoch and checkpoint, so it influenced the fitted artifact." }
      }
    ],
    glossary: [
      ["Regularization", "Preference added to learning to constrain fit and improve transfer."],
      ["L1 penalty", "Sum of absolute parameter magnitudes; can induce exact zeros."],
      ["L2 penalty", "Sum of squared parameter magnitudes; smoothly shrinks large weights."],
      ["Regularization strength", "Weight given to the complexity penalty relative to data fit."],
      ["Elastic net", "Combination of L1 and L2 penalties."],
      ["Early stopping", "Selecting a checkpoint before training completes based on validation behavior."],
      ["Weight decay", "Optimizer update that shrinks parameters, commonly related to L2 regularization."],
      ["Pruning", "Removing weakly supported tree structure."],
      ["Effective complexity", "Flexibility a fitted procedure has to represent or memorize patterns."]
    ],
    exercise: {
      duration: 35,
      title: "Build a regularization decision memo",
      brief: "A sparse churn model has 20,000 one-hot features; correlated service codes dominate and coefficients vary by fold.",
      parts: [
        "Compare L1, L2, and elastic-net searches under identical group folds.",
        "Plot train-validation gap, number of nonzero coefficients, and fold stability.",
        "Inspect whether rare category crosses are semantically justified.",
        "Recommend one model with a causal explanation of the downstream trade-off."
      ],
      solution: "Scale applicable numeric fields and fit vocabulary inside group folds. L1 may be sparse but unstable among correlated codes; L2 should share weight and improve stability; elastic net can retain groups while removing weak dimensions. Do not choose the fewest features automatically. Prefer the candidate with acceptable PR-AUC, subgroup behavior, coefficient stability, and serving cost. Remove unjustified rare crosses upstream because regularization should not legitimize a memorization surface."
    },
    sources: { core: ["googleOverfit","sklearnPipeline"], deep: ["sklearnCV","pytorchOptim"] },
    quiz: [
      { concept:"L1", prompt:"A scaled linear model needs a sparse set of features for constrained serving. Which penalty most directly encourages exact zeros?", answer:0, options:[
        ["L1","Correct. Its absolute-value geometry can drive coefficients exactly to zero."],
        ["L2","L2 shrinks smoothly but rarely makes coefficients exactly zero."],
        ["No penalty","This maximizes flexibility rather than sparsity."],
        ["Batch normalization","This is an optimization layer, not sparse linear regularization."]
      ]},
      { concept:"L2", prompt:"Two standardized predictors are strongly correlated. Which behavior is more typical of L2 than L1?", answer:2, options:[
        ["Dropping every correlated predictor.","L2 does not perform exact group deletion."],
        ["Selecting one predictor and setting all others to zero by necessity.","That is closer to unstable L1 behavior."],
        ["Sharing shrunk weight across correlated predictors.","Correct. Squared penalties often spread the signal."],
        ["Ignoring coefficient magnitude.","L2 explicitly penalizes magnitude."]
      ]},
      { concept:"Regularization direction", prompt:"In scikit-learn logistic regression, validation shows high variance. Which change strengthens regularization?", answer:1, options:[
        ["Increase `C` from 1 to 100.","`C` is inverse strength, so this weakens regularization."],
        ["Decrease `C` from 1 to 0.1.","Correct. Smaller `C` imposes stronger shrinkage."],
        ["Fit the scaler on test data.","That leaks and does not constitute legitimate regularization."],
        ["Add rare identifier crosses.","That increases memorization capacity."]
      ]},
      { concept:"Feature scale", prompt:"Why fit a scaler before applying L1 to age and balance?", answer:3, options:[
        ["To guarantee both are Gaussian.","Scaling does not guarantee Gaussian shape."],
        ["To erase all units from source data.","Raw units remain meaningful in the contract."],
        ["To make test outcomes available.","That would be leakage."],
        ["To avoid penalizing equal predictive effects differently because of units.","Correct. Coefficient magnitude depends on feature scale."],
      ]},
      { concept:"Tree controls", prompt:"A tree creates failure rules supported by one or two machines. Which control directly requires broader evidence per rule?", answer:0, options:[
        ["Increase minimum samples per leaf.","Correct. Tiny terminal partitions become illegal."],
        ["Lower k in k-nearest neighbors.","That controls another model and would increase locality."],
        ["Add a target-encoded machine ID.","That intensifies memorization risk."],
        ["Fit until training error is zero.","That encourages the brittle rules."]
      ]},
      { concept:"Early stopping", prompt:"Validation loss bottoms at epoch 18 and rises while training loss falls. What does early stopping preserve?", answer:2, options:[
        ["The final epoch because it has lowest training loss.","That ignores held-out deterioration."],
        ["A random epoch to reduce bias.","Random selection has no evidence basis."],
        ["The best validation checkpoint subject to the patience rule.","Correct. Training duration becomes a selected complexity control."],
        ["The test set as a model artifact.","Test data should not choose the checkpoint."]
      ]},
      { concept:"Limits of regularization", prompt:"A model uses a feature computed after the outcome. Strong L2 reduces its coefficient. Is the design now valid?", answer:1, options:[
        ["Yes, because small leakage is acceptable.","Availability is a binary contract issue, not a coefficient-size exemption."],
        ["No; remove the illegal feature and rebuild point-in-time evaluation.","Correct. Regularization cannot repair an information boundary."],
        ["Yes, if accuracy falls.","Lower accuracy does not make the feature deployable."],
        ["No, because L2 is only for trees.","L2 is widely used with linear and neural models."]
      ]}
    ]
  });

  register({
    id: 10,
    centralQuestion: "A model misses by 10 units. Is that tolerable, catastrophic, or impossible to tell from the average?",
    objective: "Interpret residuals, MAE, MSE, RMSE, R², MAPE, and baselines; choose a metric from error economics and diagnose hidden structure through residual slices.",
    sections: [
      {
        id: "residuals",
        title: "A residual is a signed diagnostic, not merely a loss input",
        body: [
          "For an observation with target y and prediction ŷ, define residual e = y − ŷ. Positive residuals mean underprediction under this convention; negative residuals mean overprediction. The sign matters operationally: under-forecasting demand may cause stockouts, while equal-sized over-forecasting may create holding cost. Absolute and squared metrics discard sign, so pair them with signed bias and slice plots.",
          "Residuals should show no systematic structure the model could have captured. Plot them against prediction, time, important features, and groups. A funnel shape indicates changing error variance; periodic bands suggest seasonality; consistent positive residuals for one region indicate subgroup bias. A good global RMSE can coexist with a dangerous pattern.",
          "Error distributions are often heavy-tailed. Report quantiles or tail exceedance when rare large errors matter. A mean alone cannot reveal whether every forecast misses moderately or a few misses are catastrophic."
        ],
        example: "Two demand models have MAE 8. Model A misses nearly every day by 8 units. Model B is exact on most days but misses a few launches by 200. The same MAE supports different inventory risks. Tail loss, launch-day slices, and asymmetric cost reveal the decision difference.",
        check: { question: "Why inspect signed residuals when the chosen metric is RMSE?", answer: "RMSE removes sign; signed residuals can expose systematic over- or underprediction that has asymmetric consequences." }
      },
      {
        id: "metrics",
        title: "MAE and RMSE encode different attitudes toward large errors",
        body: [
          "MAE averages |e| and remains in target units. Every additional unit of error contributes linearly, making it more robust to extreme residuals and often aligned with a constant per-unit cost. MSE averages e², strongly weighting large errors. RMSE takes the square root, returning to target units while retaining the squared-error emphasis. Neither is universally superior; choose based on the cost curve and data quality.",
          "R² compares squared error with a mean-prediction baseline on the evaluated sample: 1 is perfect, 0 matches that baseline, and negative values are possible when the model is worse. It is scale-free but not an operational cost. R² can look high for a wide-variance target despite large absolute errors, and it can change across populations with different target variance.",
          "MAPE averages percentage error by dividing by actual values. Near-zero targets make it explode; zero is undefined; it penalizes over- and underprediction asymmetrically in subtle ways and can favor underforecasting. Use only when percentage error has stable meaning and targets are safely away from zero. Alternatives include MAE scaled to a baseline or domain-specific weighted errors."
        ],
        table: table("Regression metric decision guide", ["Metric", "Error weighting", "Units", "Best use", "Failure mode"], [
          ["MAE", "Linear", "Target units", "Constant per-unit cost", "Can underemphasize catastrophic tails"],
          ["MSE", "Quadratic", "Squared units", "Optimization; strong large-error penalty", "Outlier sensitivity"],
          ["RMSE", "Quadratic", "Target units", "Communicating squared-loss scale", "Dominated by rare errors"],
          ["R²", "Relative to mean baseline", "Unitless", "Variance explained on same population", "Not cost; population-dependent"],
          ["MAPE", "Inverse weighting by actual", "Percent", "Stable positive-scale ratios", "Undefined/unstable near zero"]
        ]),
        check: { question: "If one very large error doubles while all others stay fixed, which reacts more strongly: MAE or RMSE?", answer: "RMSE, because the residual is squared before aggregation." }
      },
      {
        id: "baseline-choice",
        title: "A metric becomes meaningful only relative to an alternative",
        body: [
          "For independent stable targets, predicting the training mean is a squared-error baseline and the median is an absolute-error baseline. Time series need stronger references: last value, seasonal naïve, or the current planning rule. Evaluate baselines with the same temporal split and information cutoff as the candidate.",
          "Metric aggregation matters. Micro-averaging all rows gives high-volume entities more influence. Averaging per-store MAE weights stores equally. Neither is neutral: the first follows transaction volume; the second follows entity fairness. State the decision unit and cost weights.",
          "Select models using validation, not test. If operational cost is asymmetric, compute a custom loss that charges underprediction and overprediction differently, then retain standard metrics for comparability. Validate that the cost weights are real enough to guide deployment rather than invented precision."
        ],
        code: code("python", "import numpy as np\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n\ndef regression_report(y, pred):\n    residual = np.asarray(y) - np.asarray(pred)\n    return {\n        \"mae\": mean_absolute_error(y, pred),\n        \"rmse\": mean_squared_error(y, pred) ** 0.5,\n        \"r2\": r2_score(y, pred),\n        \"signed_bias\": residual.mean(),\n        \"p95_abs_error\": np.quantile(np.abs(residual), 0.95),\n        \"underforecast_cost\": np.maximum(residual, 0).sum() * 4,\n        \"overforecast_cost\": np.maximum(-residual, 0).sum()\n    }", [
          "Standard metrics provide comparable summaries.",
          "Signed bias exposes direction that absolute metrics hide.",
          "The 95th percentile describes tail experience.",
          "Separate cost terms encode a documented four-to-one underforecast penalty."
        ], "It prevents a model with acceptable average error but systematic or costly tail behavior from passing unnoticed."),
        check: { question: "Why compare a forecast model with a seasonal-naïve baseline instead of only the mean?", answer: "Seasonality is free, known structure; the candidate must beat the existing information a realistic simple rule already uses." }
      }
    ],
    glossary: [
      ["Residual", "Signed difference between observed and predicted target."],
      ["MAE", "Mean absolute residual magnitude."],
      ["MSE", "Mean squared residual."],
      ["RMSE", "Square root of MSE, retaining target units."],
      ["R²", "Squared-error improvement relative to a mean baseline on the evaluated sample."],
      ["MAPE", "Mean absolute percentage error; unstable near zero."],
      ["Signed bias", "Average signed residual, showing systematic direction."],
      ["Heteroscedasticity", "Error variance that changes across predictions or conditions."],
      ["Seasonal naïve", "Forecast that repeats the value from the corresponding prior season."]
    ],
    exercise: {
      duration: 35,
      title: "Choose a metric for spare-parts forecasting",
      brief: "Underforecasted critical parts cost four times overforecasted units; demand contains many zeros and occasional plant shutdown spikes.",
      parts: [
        "Explain why MAPE is unsafe and compute MAE, RMSE, bias, and p95 absolute error.",
        "Create an asymmetric business-cost metric.",
        "Compare against zero, median, and seasonal-naïve baselines.",
        "Inspect residuals for criticality class and shutdown weeks; recommend a release metric set."
      ],
      solution: "MAPE is undefined or explosive for zero demand. Use MAE for ordinary unit burden, RMSE/p95 for large misses, signed bias for direction, and an asymmetric cost based on verified shortage versus holding costs. The seasonal baseline is the serious comparator. Report critical-part slices separately because a volume-weighted average can be dominated by cheap items. Release only if cost improves without worsening the critical tail beyond an agreed guardrail."
    },
    sources: { core: ["sklearnMetrics","googleML"], deep: ["googleOverfit","sklearnCV"] },
    quiz: [
      { concept:"Residual sign", prompt:"Using residual = actual − predicted, a residual of +25 means what?", answer:1, options:[
        ["The model overpredicted by 25.","Overprediction gives a negative residual under this convention."],
        ["The model underpredicted by 25.","Correct. Actual exceeds the prediction."],
        ["The squared error is 25.","Squared error is 625."],
        ["R² increased by 25.","A single residual does not translate directly to R²."]
      ]},
      { concept:"MAE vs RMSE", prompt:"Safety policy strongly penalizes rare large temperature errors. Which standard metric emphasizes them more?", answer:2, options:[
        ["MAE","MAE grows linearly with residual magnitude."],
        ["Median signed error","This measures typical direction, not tail magnitude."],
        ["RMSE","Correct. Squaring gives large residuals disproportionate influence."],
        ["Accuracy","Accuracy is not a standard continuous-error metric."]
      ]},
      { concept:"R²", prompt:"A model has R² = −0.2 on a test population. What does that mean?", answer:0, options:[
        ["Its squared error is worse than predicting the test target mean baseline.","Correct. R² can be negative."],
        ["Twenty percent of labels are missing.","R² does not encode missingness."],
        ["The predictions are negatively calibrated.","Calibration is not defined by this statistic."],
        ["The model is necessarily malicious.","A poor score says nothing about intent."]
      ]},
      { concept:"MAPE", prompt:"A demand series contains many zeros. Why is MAPE a poor primary metric?", answer:3, options:[
        ["It is measured in target units.","MAPE is expressed as a percentage."],
        ["It squares every error.","MAPE uses absolute ratios, not squares."],
        ["It ignores small actuals.","It overweights them."],
        ["Division by zero is undefined and near-zero actuals dominate.","Correct. The metric becomes unstable and misleading."],
      ]},
      { concept:"Residual analysis", prompt:"Global MAE is stable, but one region’s residuals are consistently positive. What does that show?", answer:1, options:[
        ["The region has perfect predictions.","Positive residuals mean systematic underprediction."],
        ["A subgroup underprediction pattern hidden by the aggregate.","Correct. Investigate data, representation, and cost for that slice."],
        ["The target is nominal.","Residuals imply a continuous target."],
        ["The test set is contaminated by definition.","Bias can occur without contamination."]
      ]},
      { concept:"Baselines", prompt:"A monthly forecast beats the global mean but loses to ‘same month last year.’ What is the defensible conclusion?", answer:2, options:[
        ["Deploy because any baseline win is enough.","The serious operational baseline remains better."],
        ["Delete last year’s values from evaluation.","That hides relevant existing information."],
        ["It has not demonstrated value beyond seasonal structure.","Correct. Improve or justify other benefits before release."],
        ["R² must equal one.","Nothing in the scenario implies perfect fit."]
      ]},
      { concept:"Aggregation", prompt:"A few high-volume stores dominate row-level RMSE. Leadership also cares about equal store service. What should reporting add?", answer:0, options:[
        ["Per-store metrics and an explicitly weighted aggregate.","Correct. This shows volume and entity-level performance as separate decisions."],
        ["Only more decimal places.","Precision does not reveal weighting."],
        ["A random category code for stores.","Encoding does not change metric accountability."],
        ["Training loss in place of test results.","Training evidence cannot estimate deployment error."]
      ]}
    ]
  });

  register({
    id: 11,
    centralQuestion: "When positives are rare, which cells of the confusion matrix determine whether the system helps or overwhelms operations?",
    objective: "Compute and interpret confusion-matrix metrics; select accuracy, precision, recall, specificity, FPR, FNR, F1, and balanced accuracy from prevalence, error cost, and workflow capacity.",
    sections: [
      {
        id: "matrix",
        title: "The confusion matrix is a decision ledger",
        body: [
          "For a chosen positive class and threshold, true positives (TP) are correctly alerted positives, false positives (FP) are incorrect alerts, true negatives (TN) are correctly rejected negatives, and false negatives (FN) are missed positives. Every rate chooses a denominator and therefore answers a different operational question.",
          "Recall or sensitivity = TP/(TP+FN): among actual positives, what fraction was found? Specificity = TN/(TN+FP): among actual negatives, what fraction was correctly cleared? False-negative rate is 1−recall; false-positive rate is 1−specificity. Precision = TP/(TP+FP): among alerts, what fraction was truly positive? Precision determines reviewer yield and depends strongly on prevalence.",
          "Accuracy = (TP+TN)/N can be dominated by the majority class. Balanced accuracy averages sensitivity and specificity, giving both actual classes equal weight. F1 is the harmonic mean of precision and recall; it punishes a severe imbalance between them but ignores true negatives and assumes equal emphasis through its formula."
        ],
        diagram: diagram("confusion", "Confusion matrix at one threshold", ["TP", "FP", "FN", "TN"], [], "Rows represent actual class and columns predicted class; every derived metric selects a different row or column denominator."),
        check: { question: "Why does precision use predicted positives as its denominator?", answer: "It measures the yield of the alert queue: of everything the system asked humans or downstream actions to treat as positive, how much was correct." }
      },
      {
        id: "prevalence",
        title: "Rare positives turn a small FPR into a large workload",
        body: [
          "Consider one million transactions with 0.1% fraud: 1,000 positives and 999,000 negatives. At 90% recall and 1% FPR, the system catches 900 frauds but generates 9,990 false alerts. Precision is only 900/(900+9,990) ≈ 8.3%. A seemingly excellent 99% specificity can still swamp investigators because the negative population is enormous.",
          "Changing prevalence changes precision even if sensitivity and specificity remain constant. A model moved from a high-risk referral queue to the general population can show a much lower positive predictive value. Report the evaluation prevalence and, when planning a new setting, translate rates into expected counts.",
          "Class weighting changes the training objective; it does not change the real evaluation prevalence. Oversampling may help the learner see rare cases, but metrics should be computed on untouched, naturally distributed validation data."
        ],
        table: table("Metric to workflow question", ["Metric", "Operational question", "Blind spot"], [
          ["Recall / sensitivity", "How many real cases do we catch?", "Alert burden"],
          ["Precision", "How productive is the alert queue?", "Missed positives"],
          ["Specificity", "How many negatives do we clear?", "Positive yield"],
          ["FPR", "What fraction of negatives become false alerts?", "Absolute volume"],
          ["F1", "Are precision and recall jointly strong?", "True negatives and explicit cost"],
          ["Balanced accuracy", "How well are both classes recognized?", "Prevalence and alert capacity"]
        ]),
        failure: "Reporting a 1% FPR without multiplying by the negative traffic volume hides whether operations receive ten false alerts or ten thousand.",
        check: { question: "If prevalence falls while sensitivity and specificity stay fixed, what usually happens to precision?", answer: "It falls, because true positives become rarer relative to false positives drawn from the larger negative population." }
      },
      {
        id: "selection",
        title: "Metric choice commits to an error trade-off",
        body: [
          "Healthcare screening may prioritize high sensitivity because a false negative delays treatment, then use a confirmatory test to recover precision. Spam filtering may prioritize precision when blocking a legitimate message is costly. Fraud teams require both detection value and an alert volume that investigators can process. The metric must connect the model decision to the next system step.",
          "F1 is useful when precision and recall matter and one scalar is needed, but F-beta can weight recall differently. Explicit cost or constrained optimization is clearer when stakes are known: maximize recall subject to at least 60% precision and at most 1,000 alerts per day. Slice metrics reveal whether a threshold creates unequal error rates across groups.",
          "Always define the positive class. In anomaly detection, a library’s class ordering can invert which recall is reported. Preserve raw counts next to rates; they make denominator mistakes and operational burden visible."
        ],
        code: code("python", "from sklearn.metrics import confusion_matrix\n\ntn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()\nrecall = tp / (tp + fn)\nspecificity = tn / (tn + fp)\nprecision = tp / (tp + fp)\nfpr = fp / (fp + tn)\nfnr = fn / (fn + tp)\nbalanced_accuracy = (recall + specificity) / 2\nprint({\"tp\":tp, \"fp\":fp, \"tn\":tn, \"fn\":fn,\n       \"precision\":precision, \"recall\":recall,\n       \"specificity\":specificity, \"fpr\":fpr,\n       \"fnr\":fnr, \"balanced_accuracy\":balanced_accuracy})", [
          "The explicit label order prevents an accidental class inversion.",
          "Counts are retained alongside rates.",
          "Each denominator is visible and auditable."
        ], "It prevents a favorable rate from concealing a large absolute queue or a reversed positive-class definition."),
        check: { question: "Why can F1 be inappropriate when true negatives matter economically?", answer: "F1 uses precision and recall only; it does not directly reward correctly clearing negatives or express their volume and cost." }
      }
    ],
    glossary: [
      ["True positive", "Actual positive correctly predicted positive."],
      ["False positive", "Actual negative incorrectly predicted positive."],
      ["True negative", "Actual negative correctly predicted negative."],
      ["False negative", "Actual positive incorrectly predicted negative."],
      ["Precision", "TP divided by all predicted positives."],
      ["Recall / sensitivity", "TP divided by all actual positives."],
      ["Specificity", "TN divided by all actual negatives."],
      ["FPR", "FP divided by all actual negatives."],
      ["FNR", "FN divided by all actual positives."],
      ["Balanced accuracy", "Mean of sensitivity and specificity."],
      ["F1", "Harmonic mean of precision and recall."]
    ],
    exercise: {
      duration: 35,
      title: "Turn rates into a fraud-operations plan",
      brief: "Daily volume is 500,000, prevalence 0.4%, review capacity 1,000 alerts. Candidate threshold yields 62% recall and 91% precision on a representative holdout.",
      parts: [
        "Estimate TP, FN, FP, and alert count per day.",
        "Check whether the queue fits capacity and state the unused or exceeded capacity.",
        "Compare a second threshold with 78% recall and 72% precision.",
        "Recommend a threshold using fraud value, review capacity, and a monitoring guardrail."
      ],
      solution: "There are about 2,000 frauds/day. At 62% recall, TP≈1,240; 91% precision implies alerts≈1,363 and FP≈123, already above a 1,000 review cap despite high precision. The stated operating point is infeasible unless prioritization or capacity changes. At 78% recall and 72% precision, alerts≈2,167 and FP≈607, even further over capacity. Select a top-capacity or stricter threshold, estimate value among the top 1,000, and monitor prevalence, precision, recall from matured labels, and queue delay."
    },
    sources: { core: ["googleClass","sklearnMetrics"], deep: ["googleML","sklearnCV"] },
    quiz: [
      { concept:"Precision", prompt:"An investigator asks, ‘Of the cases you sent me, how many were actually fraud?’ Which metric answers?", answer:0, options:[
        ["Precision","Correct. Its denominator is the alert queue."],
        ["Recall","Recall starts from all actual frauds."],
        ["Specificity","Specificity starts from all negatives."],
        ["FNR","FNR measures missed positives."]
      ]},
      { concept:"Recall", prompt:"A screening program asks, ‘What fraction of actual disease cases did we detect?’ Which metric is required?", answer:2, options:[
        ["Precision","That measures yield among predicted positives."],
        ["FPR","That measures false alarms among negatives."],
        ["Sensitivity / recall","Correct. TP/(TP+FN)."],
        ["Accuracy","Accuracy mixes both classes."]
      ]},
      { concept:"Imbalance", prompt:"A classifier predicts every transaction as legitimate in a dataset with 0.1% fraud. Its accuracy is 99.9%. What is fraud recall?", answer:1, options:[
        ["99.9%","That is majority-dominated accuracy."],
        ["0%","Correct. There are no true positives."],
        ["50%","Nothing implies half the frauds are found."],
        ["Undefined","Recall is defined if actual positives exist; it equals zero here."]
      ]},
      { concept:"Prevalence", prompt:"A model keeps the same recall and specificity but moves from a 10% positive clinic to a 1% population. What usually happens to precision?", answer:3, options:[
        ["It must rise.","There are fewer true positives relative to false positives."],
        ["It equals specificity.","These rates use different denominators."],
        ["It cannot change because the model is fixed.","Precision depends on prevalence."],
        ["It falls.","Correct. The base-rate change lowers positive predictive value."]
      ]},
      { concept:"FPR volume", prompt:"A model has 0.5% FPR on ten million daily negatives. Roughly how many false alerts result?", answer:1, options:[
        ["5,000","That is 0.05%."],
        ["50,000","Correct. 10,000,000 × 0.005."],
        ["500,000","That is 5%."],
        ["The count cannot be estimated.","The negative volume and rate are given."]
      ]},
      { concept:"F1", prompt:"Which important quantity is absent from F1?", answer:0, options:[
        ["True negatives","Correct. F1 combines precision and recall."],
        ["True positives","TP appears in both components."],
        ["False positives","FP affects precision."],
        ["False negatives","FN affects recall."]
      ]},
      { concept:"Balanced accuracy", prompt:"Why can balanced accuracy be more informative than accuracy under imbalance?", answer:2, options:[
        ["It uses model probabilities without a threshold.","It is computed from thresholded class outcomes."],
        ["It always matches business cost.","It weights class recalls equally, which may not match cost."],
        ["It gives sensitivity and specificity equal influence instead of letting the majority dominate.","Correct. Each actual class contributes one half."],
        ["It guarantees high precision.","Precision still depends on prevalence and predictions."]
      ]}
    ]
  });

  register({
    id: 12,
    centralQuestion: "If a model ranks cases well but its probabilities are wrong, where should the operating threshold move—and can the business absorb it?",
    objective: "Separate scores, probabilities, and class decisions; interpret ROC-AUC, PR-AUC, average precision, and calibration; select thresholds under cost and capacity; perform slice-based error analysis.",
    sections: [
      {
        id: "score-decision",
        title: "Ranking, probability, and action are three different objects",
        body: [
          "A model may output an arbitrary score, a probability estimate, or a logit. A threshold converts that continuous output into a class decision. Lowering the positive threshold labels more observations positive: some previous false negatives become true positives, so recall tends to rise; some previous true negatives become false positives, so specificity and usually precision fall. Raising the threshold reverses the flow.",
          "Thresholds belong to the decision system, not necessarily the trained model. The same ranking can support different workflows: auto-block above 0.98, human review from 0.70 to 0.98, and pass below 0.70. Capacity constraints can make the threshold dynamic, but any change alters error rates and should be governed and monitored.",
          "Choose thresholds on validation data using expected costs or constraints, then estimate them on untouched test data. Choosing the threshold that looks best on the test set contaminates final evidence."
        ],
        diagram: diagram("threshold", "Threshold movement reassigns cases", ["Low scores", "Threshold", "High scores", "Predicted negative", "Predicted positive"], [[0,3],[1,3],[1,4],[2,4]], "Move the threshold left: more TP and more FP. Move it right: fewer FP and more FN."),
        check: { question: "Why can recall rise when a threshold is lowered without changing the model?", answer: "More scored cases cross into the positive decision region, converting some false negatives to true positives while also converting some true negatives to false positives." }
      },
      {
        id: "curves",
        title: "ROC and precision–recall curves summarize different burdens",
        body: [
          "The ROC curve plots true-positive rate against false-positive rate across thresholds. ROC-AUC measures ranking: the probability that a randomly chosen positive receives a higher score than a randomly chosen negative. It is threshold-independent in that it averages ranking behavior, not in the sense that operations need no threshold.",
          "Under extreme imbalance, a small FPR can still create enormous false-positive volume, and ROC-AUC may look strong while alert precision is poor. A precision–recall curve plots precision against recall across thresholds and focuses on the positive class and false alerts. Average precision is a common weighted summary of this curve. PR-AUC terminology can refer to different numerical integration conventions, so record the implementation.",
          "Neither area selects an operating point or captures capacity automatically. Compare curves on the same evaluation population; precision-recall behavior changes with prevalence. Use the curve to find feasible thresholds, then report the counts, costs, and slice results at the selected point."
        ],
        table: table("ROC-AUC versus precision–recall evidence", ["Question", "ROC / ROC-AUC", "PR / Average Precision"], [
          ["Axes", "TPR vs FPR", "Precision vs recall"],
          ["Emphasis", "Ranking across both classes", "Positive retrieval and alert purity"],
          ["Under rare positives", "Can appear optimistic operationally", "More sensitive to false-alert burden"],
          ["Selects threshold?", "No", "No"],
          ["Prevalence sensitivity", "Ranking AUC relatively insensitive", "Precision strongly sensitive"]
        ]),
        check: { question: "Why can two deployments with identical ROC-AUC have different precision?", answer: "Precision depends on class prevalence and the selected threshold; ROC-AUC summarizes ranking across thresholds." }
      },
      {
        id: "calibration",
        title: "Calibration asks whether stated probabilities occur at stated frequencies",
        body: [
          "Discrimination asks whether positives rank above negatives. Calibration asks whether predictions of 0.7 correspond to roughly 70% observed frequency among comparable cases. A model can rank perfectly but assign probabilities that are too extreme or too timid. Reliability diagrams bin predicted probabilities and compare mean prediction with observed rate. The Brier score averages squared probability error, combining calibration and discrimination effects.",
          "Platt scaling fits a sigmoid mapping from model scores to probability. Isotonic regression fits a flexible monotonic mapping and can overfit with little calibration data. Temperature scaling divides logits by a learned temperature, commonly for multiclass neural networks; it changes confidence while preserving class ranking. Calibration must use data separate from the base model fit, and final evaluation must remain untouched.",
          "Calibration can drift when prevalence or conditional relationships change. Recalibration may repair probability mapping under some shifts but cannot restore missing discrimination or correct concept drift. Evaluate calibration overall and by high-impact slices."
        ],
        code: code("python", "from sklearn.calibration import CalibratedClassifierCV, CalibrationDisplay\nfrom sklearn.metrics import brier_score_loss, average_precision_score\n\ncalibrated = CalibratedClassifierCV(base_estimator, method=\"isotonic\", cv=5)\ncalibrated.fit(X_train, y_train)\np = calibrated.predict_proba(X_test)[:, 1]\nprint({\"brier\": brier_score_loss(y_test, p),\n       \"average_precision\": average_precision_score(y_test, p)})\nCalibrationDisplay.from_predictions(y_test, p, n_bins=10, strategy=\"quantile\")", [
          "Cross-validated calibration avoids fitting the calibrator on the same predictions used to train each base estimator.",
          "Brier score checks probability error while average precision checks ranking/retrieval quality.",
          "Quantile bins make each reliability estimate use a similar number of cases."
        ], "It prevents treating a high-ranking score as a trustworthy probability without independent calibration evidence."),
        failure: "Calibrating on the final test set and then reporting its Brier score reuses the same outcomes for fitting and evaluation. Keep a calibration partition or use cross-validated calibration within development data.",
        check: { question: "Can calibration improve ROC-AUC when the mapping is strictly monotonic?", answer: "Usually not: monotonic calibration preserves ranking, so discrimination stays the same even while probability accuracy improves." }
      },
      {
        id: "decision-quality",
        title: "The best threshold is a constrained operating decision",
        body: [
          "Convert errors into consequences. A false negative may lose fraud value or delay treatment; a false positive consumes review capacity, inconveniences a customer, or blocks a legitimate action. Expected cost multiplies counts by credible cost estimates. When costs are uncertain, use constraints and sensitivity analysis: maximize recall while precision remains above 80%, daily alerts remain below 1,000, and no critical subgroup FNR exceeds a limit.",
          "Threshold selection should include queue dynamics. An average 1,000 alerts per day can still breach capacity during peaks, causing stale reviews and changing label feedback. A top-k policy fixes volume but lets the implicit threshold move as score distributions drift. Monitor both the realized threshold and outcome metrics.",
          "Error analysis samples high-confidence mistakes, boundary cases, and subgroup failures. Diagnose label error, missing features, shift, and workflow limitations. The goal is not only a higher scalar metric; it is a decision process whose harms, benefits, and capacity remain controlled."
        ],
        consequence: "Choosing a threshold from a headline AUC delegates policy to an arbitrary default. The model ranking may be valuable, but operations fail when the resulting alert volume, costs, or subgroup errors are infeasible.",
        check: { question: "What new risk does a fixed top-k policy introduce?", answer: "Its effective score threshold changes with traffic and score distribution, so case severity and precision may drift even though volume stays fixed." }
      }
    ],
    glossary: [
      ["Score", "Continuous model output used for ranking or transformation."],
      ["Threshold", "Boundary that converts scores or probabilities into class decisions."],
      ["ROC curve", "TPR versus FPR across thresholds."],
      ["ROC-AUC", "Threshold-aggregated ranking measure for positives versus negatives."],
      ["Precision–recall curve", "Precision versus recall across thresholds."],
      ["Average precision", "Weighted summary of precision at increasing recall."],
      ["Calibration", "Agreement between predicted probabilities and observed frequencies."],
      ["Reliability diagram", "Plot comparing predicted and observed rates in probability bins."],
      ["Brier score", "Mean squared error of predicted probabilities."],
      ["Platt scaling", "Sigmoid calibration mapping."],
      ["Isotonic regression", "Flexible monotonic calibration mapping."],
      ["Temperature scaling", "Logit rescaling that adjusts confidence while preserving ranking."]
    ],
    exercise: {
      duration: 90,
      title: "Select and defend a healthcare screening operating point",
      brief: "A model screens 50,000 people weekly at 2% prevalence. Follow-up capacity is 2,500. Missed cases cost more than unnecessary follow-ups, but one demographic slice has elevated FPR.",
      parts: [
        "Plot ROC and precision–recall curves and explain why the latter is operationally sharper here.",
        "List feasible thresholds under the capacity limit and calculate TP, FP, FN, precision, and recall.",
        "Assess reliability diagrams and Brier score overall and by slice; compare Platt and isotonic calibration using development data.",
        "Choose an operating rule with a subgroup guardrail and write a monitoring/recalibration plan.",
        "Complete the D1 timed domain exam after the lab and add uncertain items to the review queue."
      ],
      solution: "Capacity fixes predicted positives at no more than 2,500. With 1,000 actual positives, translate each candidate threshold into counts and ensure peak—not only average—volume fits. Prefer a high-recall feasible point, but do not hide low precision or unequal FPR. Fit calibration without touching the final test; isotonic needs enough calibration cases and may be unstable by slice, while Platt is less flexible. Monitor prevalence, score distribution, realized threshold, queue age, matured-label recall/precision, Brier score, and subgroup errors. Revisit the rule if capacity or costs change."
    },
    sources: { core: ["googleClass","sklearnMetrics","sklearnCalibration"], deep: ["sklearnCV","googleFairness"] },
    quiz: [
      { concept:"Threshold movement", prompt:"A fraud threshold drops from 0.8 to 0.6 with the same scores. What causal change is expected?", answer:1, options:[
        ["Fewer cases are predicted positive, so recall falls.","Lowering a threshold expands the positive region."],
        ["More cases are predicted positive; TP and FP can both rise.","Correct. Recall tends to increase while false-alert burden grows."],
        ["ROC-AUC necessarily becomes larger.","AUC uses ranking across thresholds and does not change from selecting one threshold."],
        ["Probabilities become calibrated.","Thresholding does not repair probability mapping."]
      ]},
      { concept:"ROC-AUC", prompt:"What does ROC-AUC most directly summarize?", answer:2, options:[
        ["The number of alerts at the production threshold.","AUC does not choose an operating point."],
        ["The absolute cost of errors.","Costs are not inputs to standard ROC-AUC."],
        ["How often a random positive ranks above a random negative.","Correct. It is a discrimination/ranking interpretation."],
        ["Whether 0.8 predictions occur 80% of the time.","That is calibration."]
      ]},
      { concept:"PR curve", prompt:"Why is a precision–recall curve often more revealing for 0.1% fraud?", answer:0, options:[
        ["It exposes positive retrieval and false-alert purity rather than diluting FP among huge negatives.","Correct. Precision makes the review burden visible."],
        ["It removes the need to select a threshold.","Operations still require a point or policy."],
        ["It is invariant to prevalence.","Precision changes with prevalence."],
        ["It uses only true negatives.","It focuses on TP, FP, and FN."]
      ]},
      { concept:"Calibration", prompt:"Among cases assigned probability 0.7, only 40% are positive. What is the model doing?", answer:3, options:[
        ["Under-ranking every positive.","This statement concerns probability agreement, not full ranking."],
        ["Achieving perfect specificity.","No negative-class rate is given."],
        ["Understating risk.","Predicted risk exceeds observed frequency."],
        ["Overstating risk in that probability region.","Correct. The predictions are overconfident/high there."],
      ]},
      { concept:"Brier score", prompt:"Which prediction has lower single-case Brier loss when the outcome is 1: p=0.8 or p=0.6?", answer:1, options:[
        ["p=0.6 because it is less confident.","Its squared error is (1−0.6)²=0.16."],
        ["p=0.8 because its squared error is 0.04.","Correct. (1−0.8)²=0.04."],
        ["They are equal because the class decision is positive.","Brier score uses probabilities, not only thresholded classes."],
        ["Neither; Brier is undefined for binary outcomes.","Brier score is commonly used for binary probabilities."]
      ]},
      { concept:"Platt vs isotonic", prompt:"Calibration data is small and the score-probability relation appears smooth and sigmoid-like. Which method is less flexible and often safer?", answer:0, options:[
        ["Platt scaling","Correct. Its parametric sigmoid has lower variance than isotonic in small samples."],
        ["Isotonic regression","Its flexibility can overfit limited calibration data."],
        ["Random oversampling on test","That contaminates evaluation and is not calibration."],
        ["Min-max scaling scores to [0,1]","A range transform does not establish probability meaning."]
      ]},
      { concept:"Temperature scaling", prompt:"What typically stays unchanged when positive temperature scaling is applied to multiclass logits?", answer:2, options:[
        ["Every predicted probability.","Probabilities change."],
        ["Brier score by definition.","Calibration error may improve or worsen."],
        ["The ordering of class logits and predicted class.","Correct. Dividing all logits by one positive temperature preserves rank."],
        ["The model’s training dataset.","The dataset is unrelated, but this misses the calibration property being tested."]
      ]},
      { concept:"Capacity", prompt:"A threshold maximizes F1 but creates 8,000 alerts for a team that can review 1,000. What is the best response?", answer:1, options:[
        ["Deploy it because F1 is mathematically optimal.","A scalar optimum is infeasible under the workflow constraint."],
        ["Choose among thresholds or prioritization rules that satisfy capacity, then compare value and harm.","Correct. Capacity is part of the decision objective."],
        ["Hide 7,000 alerts after prediction without tracking them.","Silent truncation changes recall and accountability."],
        ["Recalculate training accuracy.","Training accuracy does not solve queue capacity."]
      ]},
      { concept:"Top-k policy", prompt:"A service always reviews the top 500 scores. Incoming score distribution shifts upward. What should monitoring detect?", answer:3, options:[
        ["Review volume will exceed 500 by definition.","Top-k fixes volume."],
        ["ROC-AUC becomes exactly one.","Distribution shift does not guarantee ranking perfection."],
        ["The model retrains automatically.","No retraining trigger is implied."],
        ["The implicit threshold and risk mix can change even though volume stays fixed.","Correct. Fixed capacity hides a moving decision boundary."],
      ]},
      { concept:"Slice evaluation", prompt:"Overall calibration is good, but one device group is systematically overconfident. Why is global recalibration alone insufficient?", answer:0, options:[
        ["It may average away the subgroup defect and leave harmful decisions unchanged.","Correct. Inspect cause and group-specific reliability under governance constraints."],
        ["Calibration can never be measured by group.","Reliability and Brier metrics can be sliced."],
        ["The device group must be removed from production forever.","That is a risk decision, not an automatic statistical conclusion."],
        ["ROC-AUC already proves probabilities are correct.","Discrimination and calibration are distinct."]
      ]}
    ]
  });
})();
