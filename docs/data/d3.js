(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 25,
    centralQuestion: "If model code, business policy, and transport logic live in one notebook, which change can be made safely?",
    objective: "Decompose an AI application into domain, feature, model, service, and adapter boundaries; apply modularity, separation of concerns, interfaces, and configuration without hiding data contracts.",
    sections: [
      {
        id: "boundaries",
        title: "Separate reasons to change",
        body: [
          "An AI product contains more than a model: input validation, feature construction, artifact loading, inference, business decisions, authorization, persistence, and transport. Modularity groups code around coherent responsibilities and exposes explicit interfaces between them. Separation of concerns means a change in HTTP routing should not require editing feature mathematics, and a new database driver should not alter decision policy.",
          "A useful core contains domain types and pure decision logic. Adapters translate external records into those types, call model runtimes, and persist results. The API layer converts HTTP requests and errors. Model code should return scores and metadata; the application decides thresholds, queue routing, and permissions unless those policies are intentionally part of the versioned artifact.",
          "Boundaries make testing sharper. A deterministic feature transformer can be unit-tested without a web server. The inference adapter can be tested against a fixture artifact. The end-to-end route can then verify composition. Too many tiny modules create navigation cost, but one mutable global pipeline makes every test and deployment fragile."
        ],
        table: table("AI service responsibilities", ["Layer", "Owns", "Must not silently own"], [
          ["Transport/API", "HTTP parsing, status, serialization", "Feature meaning"],
          ["Application", "Workflow, retries, policy sequence", "Vendor-specific data access"],
          ["Domain", "Decision concepts and invariants", "HTTP or database details"],
          ["Model adapter", "Artifact interface, score semantics", "User authorization"],
          ["Infrastructure adapter", "Database/vector/vendor calls", "Business thresholds"]
        ]),
        check: { question: "Why should a model adapter usually return a score rather than approve a payment itself?", answer: "Scoring and authorized business action have different change, testing, and security responsibilities; the application must enforce policy and identity." }
      },
      {
        id: "contracts",
        title: "Interfaces carry semantics, not only function signatures",
        body: [
          "A Python protocol or abstract interface can express required behavior without binding the core to one implementation. Yet `predict(record) -> float` is incomplete unless the score’s class, range, calibration version, input timestamp, and error behavior are defined. Use typed domain objects, schemas, and documented invariants.",
          "Dependency injection supplies adapters to application logic instead of constructing them inside every method. Tests can provide deterministic fakes; production supplies real clients. This reduces global state and makes time, random number generators, and model versions controllable dependencies.",
          "Configuration expresses environment-specific values—endpoints, timeouts, model aliases, thresholds—while code expresses logic. Validate configuration at startup and fail closed on missing critical values. Avoid a generic dictionary passed everywhere; typed settings make ownership visible."
        ],
        example: "A churn endpoint imports a global model and reads `THRESHOLD` on every request. Tests race when changing the environment, and a partial deploy serves a new model with the old threshold. A versioned `DecisionPolicy` plus injected `ModelScorer` loads once at startup and reports both identifiers in every response.",
        failure: "Calling every boundary ‘utils’ hides responsibility. A utilities module that parses data, loads models, calls vendors, and applies thresholds becomes a coupling center with no meaningful contract.",
        check: { question: "What advantage does injecting a clock provide?", answer: "Time-dependent logic becomes deterministic and testable without patching global system time." }
      },
      {
        id: "python-practice",
        title: "Python engineering makes state and failure explicit",
        body: [
          "Use small typed functions, immutable value objects where practical, context managers for resources, and narrow exceptions that preserve cause. Avoid mutable default arguments and import-time network calls. A module import should define behavior, not unexpectedly download a model or connect to production.",
          "Log at boundaries with structured fields such as request ID, model version, duration, outcome, and error class. Do not log raw sensitive prompts or records by default. Return domain errors upward and map them once to transport status; catching `Exception` everywhere converts defects into ambiguous success or retry storms.",
          "A reproducible entrypoint loads validated settings, establishes dependencies, verifies artifact compatibility, and starts serving. Startup probes should fail until required dependencies and model state are ready."
        ],
        code: code("python", "from dataclasses import dataclass\nfrom typing import Protocol\n\n@dataclass(frozen=True)\nclass RiskScore:\n    probability: float\n    model_version: str\n\nclass Scorer(Protocol):\n    def score(self, features: dict[str, float]) -> RiskScore: ...\n\n@dataclass(frozen=True)\nclass DecisionPolicy:\n    threshold: float\n    version: str\n\n    def decide(self, result: RiskScore) -> str:\n        if not 0 <= result.probability <= 1:\n            raise ValueError(\"score violates probability contract\")\n        return \"review\" if result.probability >= self.threshold else \"pass\"", [
          "The protocol decouples workflow code from a particular runtime.",
          "The result carries model identity with the probability.",
          "The policy is a separate versioned, immutable dependency.",
          "A range invariant catches incompatible or uncalibrated outputs."
        ], "It prevents silent coupling between an unversioned model score and a mutable decision threshold."),
        check: { question: "Why avoid downloading a model at module import time?", answer: "Imports become slow, side-effectful, network-dependent, and difficult to test; lifecycle loading belongs in explicit startup logic." }
      }
    ],
    glossary: [
      ["Modularity", "Decomposition into cohesive components with explicit interfaces."],
      ["Separation of concerns", "Keeping responsibilities with different reasons to change apart."],
      ["Domain layer", "Core decision concepts and invariants independent of transport/infrastructure."],
      ["Adapter", "Translation between a stable application interface and an external implementation."],
      ["Dependency injection", "Supplying dependencies from outside a component."],
      ["Protocol", "Structural Python interface describing required methods or attributes."],
      ["Configuration", "Validated environment- or release-specific settings external to core logic."],
      ["Invariant", "Condition that must remain true for a valid domain object or operation."],
      ["Structured logging", "Machine-readable log events with stable fields."],
      ["Fail closed", "Deny or stop when a critical control cannot be verified."]
    ],
    exercise: {
      duration: 35,
      title: "Refactor a notebook into service boundaries",
      brief: "A notebook reads a database, cleans fields, loads a pickle, predicts, applies a threshold, emails reviewers, and catches every exception.",
      parts: [
        "Draw domain, application, model, database, notification, and API boundaries.",
        "Define typed contracts for raw request, feature vector, score, and decision.",
        "Inject scorer, clock, and notification dependencies.",
        "Map four failure classes to explicit handling and structured log fields."
      ],
      solution: "Keep feature and policy logic independent of HTTP and vendor clients. Database and email become adapters behind narrow interfaces; the application orchestrates them. Define artifact/version and score semantics in the scorer contract. Inject a clock for label/expiry logic and a fake notifier for tests. Validation errors are client failures, missing artifacts are startup/unavailable failures, vendor timeouts are bounded retriable failures, and invariant breaches are internal defects. Log IDs and versions, not sensitive record contents."
    },
    sources: { core: ["pythonVenv","fastapi"], deep: ["jsonSchema","pytest"] },
    quiz: [
      { concept:"Separation of concerns", prompt:"A threshold change requires rebuilding the HTTP router and database client. What design smell is strongest?", answer:1, options:[
        ["The model has too few layers.","Architecture depth is unrelated."],
        ["Business policy is coupled to transport and infrastructure.","Correct. Different reasons to change are entangled."],
        ["The label is ordinal.","No label semantics are described."],
        ["The request uses JSON.","JSON is not inherently coupled."]
      ]},
      { concept:"Model boundary", prompt:"Which component should enforce whether the current user may approve a high-value action?", answer:2, options:[
        ["The embedding layer.","Representations are not authorization controls."],
        ["The model score function.","A score is not identity or permission."],
        ["Deterministic application/tool authorization at the action boundary.","Correct."],
        ["A prompt adjective.","Prompt wording cannot guarantee access control."]
      ]},
      { concept:"Dependency injection", prompt:"Why inject a model scorer into workflow code?", answer:0, options:[
        ["Tests can substitute a deterministic fake and production can supply a real adapter.","Correct."],
        ["It guarantees the model is accurate.","Design does not establish model quality."],
        ["It removes all interfaces.","Injection relies on an interface."],
        ["It makes secrets public.","Secrets should remain encapsulated."]
      ]},
      { concept:"Configuration", prompt:"A required model alias is absent at startup. What is safest?", answer:3, options:[
        ["Choose a random model.","That is unreproducible and unsafe."],
        ["Serve success with empty predictions.","That disguises unavailability."],
        ["Read an unversioned developer file silently.","That breaks configuration control."],
        ["Fail startup/readiness with a clear non-sensitive error.","Correct. Critical configuration must validate before traffic."],
      ]},
      { concept:"Structured logging", prompt:"Which inference log is most useful and least risky?", answer:1, options:[
        ["Full raw patient record and API key.","This leaks sensitive data and credentials."],
        ["Correlation ID, model/policy versions, latency, result class, and redacted error type.","Correct."],
        ["Only the sentence ‘something happened.’","It cannot support diagnosis."],
        ["A screenshot of memory.","It is not structured or privacy-minimized."]
      ]},
      { concept:"Exceptions", prompt:"Every function catches `Exception` and returns `None`. What downstream failure follows?", answer:0, options:[
        ["Callers cannot distinguish invalid input, dependency outage, and programmer defect.","Correct. Errors lose semantics and may be retried or treated as success incorrectly."],
        ["Python automatically retries once.","No such behavior exists."],
        ["The model becomes calibrated.","Error handling does not calibrate."],
        ["HTTP always returns 201.","Status mapping is unspecified."]
      ]},
      { concept:"Import side effects", prompt:"A module downloads a 5 GB model when imported. Why is this harmful?", answer:2, options:[
        ["Imports should always train models instead.","Training at import would be worse."],
        ["The file becomes unstructured data.","The issue is lifecycle state."],
        ["Tests and startup become hidden network-dependent operations.","Correct. Load explicitly in controlled startup."],
        ["Model size guarantees high accuracy.","Size does not guarantee quality."]
      ]}
    ]
  });

  register({
    id: 26,
    centralQuestion: "The same commit produces different predictions on two machines. Which environment fact was not captured?",
    objective: "Control environments, dependencies, configuration, randomness, serialization, and artifact loading; explain why reproducibility requires code, data, model, and runtime lineage together.",
    sections: [
      {
        id: "environments",
        title: "Isolation prevents one project from redefining another",
        body: [
          "A virtual environment isolates installed Python packages for a project. Dependency management records direct and transitive packages; pinning exact versions improves replay, while broad ranges ease updates but allow behavior to shift. Lock files capture a resolved set for a platform. System libraries, drivers, and accelerator runtimes sit below Python and must also be compatible.",
          "Reproducibility is not ‘works on my machine.’ It means a declared input and artifact set can recreate behavior closely enough for the purpose. Floating `latest` dependencies, mutable model names, and unrecorded preprocessing assets make identical code insufficient. Containers package much of the userspace, but CPU/GPU hardware, kernels, external services, and nondeterministic operations can still differ.",
          "Use separate development, test, and production configuration while keeping logic identical. Environment variables are delivery mechanisms, not validation; typed settings should check URLs, timeouts, allowed modes, and missing secrets."
        ],
        table: table("Reproducibility layers", ["Layer", "Record", "Typical hidden change"], [
          ["Code", "Commit/tag", "Uncommitted notebook cell"],
          ["Data", "Snapshot/hash/schema", "Mutable table view"],
          ["Model", "Immutable artifact/version", "Alias moved"],
          ["Config", "Versioned non-secret values", "Threshold environment drift"],
          ["Python", "Lock/resolved package set", "Transitive upgrade"],
          ["System", "Image digest, drivers, hardware", "CUDA/kernel difference"]
        ]),
        check: { question: "Why is `model: latest` insufficient for reproduction?", answer: "The reference can move to a different artifact; record an immutable version or digest and optionally the alias resolution time." }
      },
      {
        id: "artifacts",
        title: "Serialization is executable compatibility, not archival magic",
        body: [
          "Model serialization stores parameters and sometimes executable structure. Python pickle-like formats can execute code during loading and should never be loaded from untrusted sources. They also depend on class definitions and library versions. Framework state dictionaries separate parameters from code more cleanly but require reconstructing a compatible architecture.",
          "An artifact manifest should include model format, checksum, framework/runtime versions, input/output schema, preprocessing artifact, tokenizer or label map, training lineage, and expected resource profile. Verify checksums and compatibility before marking readiness. Load once at startup or through a controlled hot-swap path, not on every request.",
          "Model and preprocessing are one behavioral unit. Loading a new classifier with an old category vocabulary may produce valid tensor shapes and invalid meaning. Compatibility tests need semantic fixtures whose expected outputs or tolerances are known."
        ],
        example: "A serialized scikit-learn model loads after a minor library upgrade but changes probabilities because a preprocessing default changed. The API contract still passes. A locked runtime, version manifest, and golden feature/prediction fixtures would surface the behavioral difference before deployment.",
        failure: "Checksum verification proves bytes are intact, not that they are trusted or compatible. Establish artifact provenance, signature/access policy, and semantic tests as separate controls.",
        check: { question: "Why load an artifact during startup rather than per request?", answer: "It amortizes cost, makes readiness truthful, and prevents request-by-request version or availability inconsistency." }
      },
      {
        id: "randomness",
        title: "Determinism has a scope and a cost",
        body: [
          "Random seeds affect initialization, shuffling, augmentation, and sampling, but one seed does not control every library or distributed operation. GPU kernels may use nondeterministic algorithms; parallel reductions can vary at floating-point rounding boundaries. External AI services may change behind a stable name.",
          "For research, log seeds and run important comparisons across several seeds to estimate variance. For tests, use deterministic small fixtures and tolerances rather than expecting bit-identical floating-point output everywhere. If strict determinism is required, enable supported deterministic algorithms and accept potential performance cost.",
          "Configuration changes are release changes. A threshold, prompt, timeout, or tokenizer revision can alter behavior without a code commit. Version them, review differences, and include them in response/trace metadata where appropriate."
        ],
        code: code("python", "from pathlib import Path\nimport hashlib, json, joblib\n\ndef load_bundle(path: Path, expected_sha256: str):\n    payload = path.read_bytes()\n    actual = hashlib.sha256(payload).hexdigest()\n    if actual != expected_sha256:\n        raise RuntimeError(\"artifact checksum mismatch\")\n    bundle = joblib.load(path)  # only from a trusted, access-controlled source\n    required = {\"model_version\", \"input_schema_version\", \"pipeline\"}\n    if not required.issubset(bundle):\n        raise RuntimeError(\"incomplete artifact manifest\")\n    return bundle", [
          "Bytes are verified before deserialization.",
          "The comment makes the trust requirement explicit because joblib/pickle loading can execute code.",
          "A manifest check prevents serving a naked estimator without schema identity."
        ], "It prevents corrupted or incomplete bundles from becoming ready, while acknowledging that checksum alone does not make an untrusted pickle safe."),
        check: { question: "Why run multiple seeds for an important model comparison?", answer: "A single stochastic outcome may be lucky or unlucky; repeated seeds estimate whether the observed gain is stable relative to training variance." }
      }
    ],
    glossary: [
      ["Virtual environment", "Isolated Python installation context for project packages."],
      ["Dependency pinning", "Restricting package versions to a reproducible set."],
      ["Lock file", "Resolved dependency graph with concrete versions and often hashes."],
      ["Serialization", "Encoding model state or structure for storage and loading."],
      ["Artifact manifest", "Metadata describing model format, versions, schema, lineage, and compatibility."],
      ["Checksum", "Digest used to detect byte changes."],
      ["Golden fixture", "Stable input with expected behavior used for compatibility regression."],
      ["Determinism", "Repeatability under a stated runtime and algorithm scope."],
      ["Transitive dependency", "Package required by another dependency rather than directly."],
      ["Image digest", "Immutable content identifier for a container image."]
    ],
    exercise: {
      duration: 35,
      title: "Reproduce a disputed prediction",
      brief: "Two environments run the same commit but return 0.61 and 0.74 for one record; the production threshold is 0.70.",
      parts: [
        "Build a comparison matrix for raw input, feature vector, pipeline/model digests, config, dependencies, and hardware.",
        "Use golden fixtures to localize the first divergence.",
        "Define an artifact manifest and startup compatibility checks.",
        "Explain how the result changed the action and what release control was missing."
      ],
      solution: "Compare the canonical validated request first, then feature names/order/values, preprocessing and model digests, threshold version, library lock, and runtime image. The first mismatching layer is the repair boundary. A 0.61 versus 0.74 divergence crosses the decision threshold, so this is not harmless floating-point noise. Record an immutable bundle containing preprocessing and model, validate schema/feature fixtures at startup, pin runtime dependencies, and log model/policy versions with each decision."
    },
    sources: { core: ["pythonVenv","dockerImages"], deep: ["pytest","mlflowTracking"] },
    quiz: [
      { concept:"Dependency pinning", prompt:"A transitive numerical library upgrades overnight and predictions shift. Which control was missing?", answer:0, options:[
        ["A resolved, reviewed dependency lock tied to the release.","Correct."],
        ["A higher model threshold only.","That masks rather than explains behavior change."],
        ["A larger test request.","Request size does not control runtime versions."],
        ["An unbounded retry.","Retries repeat the changed behavior."]
      ]},
      { concept:"Artifact identity", prompt:"Production resolves a mutable `champion` alias. What should each trace also record?", answer:2, options:[
        ["Only the alias string.","It does not reveal which version was resolved."],
        ["The developer’s laptop name.","That is not the serving artifact."],
        ["The immutable model version or digest actually loaded.","Correct."],
        ["The number of CSS rules.","Unrelated to inference."]
      ]},
      { concept:"Serialization security", prompt:"A user uploads a pickle claiming it is a model. Why should the service not load it?", answer:1, options:[
        ["Pickle never stores parameters.","It can store rich Python objects."],
        ["Deserialization can execute attacker-controlled code.","Correct. Accept only trusted, controlled artifacts or safer formats."],
        ["Pickle is always larger than GPU memory.","Size is not the defining risk."],
        ["It forces deterministic inference.","It does not."]
      ]},
      { concept:"Preprocessing compatibility", prompt:"A classifier version changes but the old label encoder remains. Tensor shapes still match. Is deployment safe?", answer:3, options:[
        ["Yes, shape proves semantics.","Column/order meanings can differ."],
        ["Yes, if latency is low.","Performance cannot establish semantic compatibility."],
        ["No, because models cannot be serialized.","They can be under controlled formats."],
        ["No; validate the model and preprocessing as one versioned behavioral bundle.","Correct."],
      ]},
      { concept:"Checksums", prompt:"An artifact checksum matches. What has been established?", answer:1, options:[
        ["The model is accurate and authorized.","Quality and trust require separate evidence."],
        ["The bytes match the expected digest.","Correct. Integrity under that reference is established."],
        ["The artifact cannot contain executable code.","Pickle-like formats can."],
        ["Every dependency is compatible.","Compatibility must be checked separately."]
      ]},
      { concept:"Random seeds", prompt:"Two seeded GPU runs still differ slightly. Which statement is most accurate?", answer:2, options:[
        ["Seeds guarantee bit identity on every hardware and operation.","Some kernels and distributed reductions are nondeterministic."],
        ["The labels must be wrong.","Run variation does not prove label defects."],
        ["Seed scope, deterministic algorithms, library versions, and hardware must be considered.","Correct."],
        ["Remove all evaluation tolerances.","Appropriate tolerances can be essential."]
      ]},
      { concept:"Startup loading", prompt:"A service downloads and loads a model on every request. Which redesign is best?", answer:0, options:[
        ["Load and validate one immutable artifact during controlled startup, then expose readiness.","Correct."],
        ["Cache whichever version happens to download first without identity.","That is nondeterministic."],
        ["Return HTTP 200 while loading fails.","That disguises outage."],
        ["Put the model binary into request logs.","That is wasteful and risky."]
      ]}
    ]
  });

  register({
    id: 27,
    centralQuestion: "Can the inference service reject a malformed or semantically impossible request before the model turns it into a plausible score?",
    objective: "Design RESTful inference contracts with HTTP methods, status codes, JSON Schema/Pydantic validation, versioning, response metadata, and a FastAPI implementation.",
    sections: [
      {
        id: "http-contract",
        title: "HTTP semantics tell clients what happened",
        body: [
          "REST is an architectural style around resources, representations, stateless interactions, and uniform interfaces. In practice, an inference API uses HTTP methods deliberately: GET retrieves without intended state change; POST submits a prediction or job; PUT replaces an addressed resource and is expected to be idempotent; DELETE removes one. A prediction POST can be computationally expensive yet still stateless from the client perspective.",
          "Status codes separate outcomes. 200 returns a completed response; 201 indicates a created resource such as a batch job; 202 accepts work not yet complete. 400 covers malformed requests, 401 missing/invalid authentication, 403 authenticated but unauthorized, 404 absent resource, 409 state conflict, 422 semantically invalid structured input in common API practice, 429 rate limit, 500 unexpected defect, and 503 temporary unavailability.",
          "Returning 200 with `{error: ...}` breaks monitoring, retries, client libraries, and SLAs. Error bodies should use a stable code, safe message, correlation ID, and field details when appropriate—never stack traces or secrets."
        ],
        table: table("Status code as client guidance", ["Code", "Meaning", "Client behavior"], [
          ["200", "Completed successfully", "Consume result"],
          ["202", "Accepted for asynchronous processing", "Poll/callback using job ID"],
          ["400/422", "Malformed or semantically invalid input", "Fix request; do not blindly retry"],
          ["401/403", "Identity absent/permission denied", "Authenticate or request access"],
          ["429", "Rate limited", "Back off per policy"],
          ["503", "Temporarily unavailable", "Bounded retry/failover"]
        ]),
        check: { question: "Why is a 403 different from 401?", answer: "401 means valid authentication is absent or failed; 403 means identity is known but lacks permission for the operation." }
      },
      {
        id: "schema",
        title: "A schema rejects syntax; domain validation rejects impossible meaning",
        body: [
          "JSON Schema and Pydantic can require fields, types, bounds, formats, arrays, and enumerations. A request contract should define null versus omitted, unknown-field policy, units, time zone, maximum lengths, and version. Strictness prevents silent coercion—for example, treating the string `NaN` as a number or truncating an oversized prompt.",
          "Cross-field rules require domain logic: end time must follow start time; currency must match the account; feature timestamp must not exceed prediction time. Validation must run before model transformation. If optional fields are imputed, the response or trace should retain missingness and the model’s expected schema version.",
          "Response contracts include prediction, class semantics, model version, policy version, request/correlation ID, and warnings. Do not expose raw internal logits if clients could mistake them for probabilities. Version breaking contracts through a route, header, or media type and keep compatibility policy explicit."
        ],
        example: "A client sends `age: -4` and `income: 'unknown'`. A permissive pipeline coerces income to null and clips age to zero, returning a confident decision. A strict API returns field-level 422 details before inference, preserving both safety and producer accountability.",
        failure: "Schema validation alone does not authorize data access or prove feature availability. It checks the shape and declared constraints of what arrived, not whether the caller may use it or whether it existed at the decision time.",
        check: { question: "Why should model and policy versions appear in a prediction response?", answer: "They make the behavioral components that produced the decision traceable for audit, rollback, and client debugging." }
      },
      {
        id: "fastapi",
        title: "FastAPI turns typed contracts into executable boundaries",
        body: [
          "FastAPI uses type hints and Pydantic models to parse and validate requests and serialize responses. Dependency injection supplies authentication, services, and settings. Startup lifespan logic loads a model once and marks readiness only after validation. Route functions should remain thin: validate, authorize, call application logic, and map known errors.",
          "Do not block the event loop with CPU-heavy inference in an async route. A synchronous route can run in a thread pool, or inference can be delegated to a dedicated worker/server. `async` helps when awaiting non-blocking I/O; it does not make CPU/GPU work faster.",
          "Generate OpenAPI from the implementation and test it as a client contract. Avoid changing response types silently; model consumers often depend on field names and enum values even when HTTP remains successful."
        ],
        code: code("python", "from fastapi import FastAPI, Depends, HTTPException\nfrom pydantic import BaseModel, Field, ConfigDict\n\nclass PredictRequest(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    age: int = Field(ge=18, le=100)\n    balance_sar: float = Field(ge=0)\n\nclass PredictResponse(BaseModel):\n    probability: float = Field(ge=0, le=1)\n    decision: str\n    model_version: str\n    policy_version: str\n    request_id: str\n\n@app.post(\"/v1/predictions\", response_model=PredictResponse)\ndef predict(body: PredictRequest, service=Depends(get_service)):\n    try:\n        return service.predict(body)\n    except ModelUnavailable as exc:\n        raise HTTPException(status_code=503, detail={\"code\": \"MODEL_UNAVAILABLE\"}) from exc", [
          "Unknown fields are rejected to catch client/schema drift.",
          "Bounds prevent impossible values before feature transformation.",
          "The response makes model and policy lineage explicit.",
          "A known temporary dependency failure maps to 503 rather than a fake success."
        ], "It prevents silent field acceptance, invalid feature creation, untraceable decisions, and ambiguous outage handling."),
        check: { question: "Why can a synchronous FastAPI route be safer for CPU-bound inference than naïvely marking it async?", answer: "FastAPI can run sync work off the event loop; CPU-bound code inside async blocks the loop and delays unrelated requests." }
      }
    ],
    glossary: [
      ["REST", "Resource-oriented architectural style using uniform stateless interfaces."],
      ["HTTP method", "Verb communicating intended operation semantics."],
      ["Status code", "Standard numeric outcome class guiding clients and monitoring."],
      ["Request contract", "Declared fields, types, constraints, and semantics accepted by an endpoint."],
      ["Response contract", "Declared output representation and meaning."],
      ["JSON Schema", "Vocabulary for validating JSON structure and constraints."],
      ["Pydantic", "Python validation/serialization library used by FastAPI."],
      ["OpenAPI", "Machine-readable HTTP API description."],
      ["Idempotent", "Repeated identical operation has the same intended effect as one."],
      ["Semantic validation", "Checks relationships and domain meaning beyond primitive types."]
    ],
    exercise: {
      duration: 35,
      title: "Implement a versioned prediction contract",
      brief: "Create an endpoint for equipment-failure risk with readings, event time, prediction time, unit, and asset ID.",
      parts: [
        "Define strict request and response models, including cross-field time and unit rules.",
        "Map invalid input, unknown asset, unauthorized asset, rate limit, model outage, and defect to statuses.",
        "Load the pipeline at startup and expose readiness separately from liveness.",
        "Write one backward-compatible and one breaking-contract change."
      ],
      solution: "Reject unknown fields, invalid ranges, wrong units, and event times after prediction time. Use 422 for semantic input errors, 404 only when revealing existence is permitted, 403 for known unauthorized access, 429 for quota, 503 for temporary model unavailability, and 500 for unexpected defects. Return probability, decision, model/policy versions, and request ID. Adding an optional warning can be compatible; renaming `probability` or changing units is breaking and requires a version policy."
    },
    sources: { core: ["fastapi","jsonSchema"], deep: ["pytest"] },
    quiz: [
      { concept:"HTTP methods", prompt:"A client creates a long-running batch scoring job. Which response best represents accepted but incomplete work?", answer:2, options:[
        ["200 with an invented final score.","Work is not complete."],
        ["404 because results do not exist yet.","The job can be created even before results."],
        ["202 with a job resource/location to check.","Correct."],
        ["500 because asynchronous work is unsupported by HTTP.","HTTP supports accepted asynchronous workflows."]
      ]},
      { concept:"Status codes", prompt:"A token is valid, but the user may not score this tenant’s records. Which status is appropriate?", answer:1, options:[
        ["401","Identity is authenticated."],
        ["403","Correct. The known identity lacks authorization."],
        ["200 with empty data","That hides denial and breaks client behavior."],
        ["503","The service may be healthy; access is denied."]
      ]},
      { concept:"Validation", prompt:"A date string parses, but it is later than prediction time. What kind of check catches this?", answer:3, options:[
        ["Only JSON syntax parsing.","Both are valid strings/dates syntactically."],
        ["Rate limiting.","Quota does not validate meaning."],
        ["Authentication.","Identity does not validate temporal order."],
        ["Cross-field semantic validation.","Correct."],
      ]},
      { concept:"Unknown fields", prompt:"A client sends misspelled `balnce_sar`; the schema ignores extras and imputes missing balance. What risk follows?", answer:0, options:[
        ["A producer defect becomes a plausible but wrong prediction.","Correct. Forbid unknowns and require intended fields."],
        ["The model automatically retrains.","No training occurs."],
        ["HTTP becomes stateful.","Field behavior does not determine statefulness."],
        ["Authorization improves.","No permission control is added."]
      ]},
      { concept:"Response semantics", prompt:"Why not expose a raw logit as `probability`?", answer:2, options:[
        ["Logits are always strings.","They are numerical scores."],
        ["Probabilities cannot exceed one only in training.","Probability bounds apply generally."],
        ["Clients may treat an unbounded score as calibrated risk.","Correct. Name and transform outputs honestly."],
        ["Logits reveal source code.","Not necessarily; the semantic mislabel is primary."]
      ]},
      { concept:"Async", prompt:"A CPU-heavy inference function runs directly inside an `async def` route with no await. What can happen?", answer:1, options:[
        ["Python distributes it to GPUs automatically.","Async does not change execution hardware."],
        ["It blocks the event loop and delays other requests.","Correct. Use a worker, inference server, or suitable sync offload."],
        ["The model gains more parameters.","Routing does not change model size."],
        ["The request becomes idempotent.","Concurrency syntax does not define effects."]
      ]},
      { concept:"API versioning", prompt:"Version 1 returns amount in SAR; a change silently returns halalas under the same field. What is required?", answer:0, options:[
        ["Treat it as a breaking semantic change with explicit version/migration.","Correct. Same type does not mean compatible meaning."],
        ["Keep the route because JSON still parses.","Parsing hides a 100× error."],
        ["Increase timeout.","Latency is unrelated."],
        ["Remove unit documentation.","That worsens ambiguity."]
      ]}
    ]
  });

  register({
    id: 28,
    centralQuestion: "Should a prediction request wait synchronously, stream partial results, retry a dependency, or become a queued job?",
    objective: "Choose sync, async, batch, and streaming interfaces; implement timeouts, bounded retries, idempotency, rate limiting, queues, and error handling without duplicate effects or retry storms.",
    sections: [
      {
        id: "interaction",
        title: "Interface shape follows when value must exist",
        body: [
          "A synchronous endpoint holds the request open until a result or timeout; it fits low-latency predictions needed immediately. An asynchronous job endpoint accepts work, returns a job ID, and completes later; it fits large batches or long processing. Streaming returns incremental output, improving perceived latency for generation but complicating cancellation, partial validation, moderation, and client recovery.",
          "Batch endpoints amortize model loading and accelerator work across many examples, but request size must be bounded and partial failures represented. One invalid record can reject the whole atomic batch or produce per-item statuses; choose and document the contract. Message queues decouple arrival from processing and absorb bursts, at the cost of eventual completion, ordering rules, and duplicate delivery handling.",
          "Async programming improves I/O concurrency when tasks await external systems. It does not reduce GPU compute. A service may use async HTTP to gather features, then send inference to a bounded worker pool so load cannot exhaust memory."
        ],
        table: table("Interaction design", ["Mode", "Client gets", "Best fit", "Failure to design"], [
          ["Synchronous", "Final response", "Immediate low-latency decision", "Timeout and thread exhaustion"],
          ["Async job", "Job ID then result", "Long/batch work", "Lost jobs and ambiguous state"],
          ["Streaming", "Incremental events/tokens", "Generative UX", "Partial unsafe output and cancellation leaks"],
          ["Queue", "Durable accepted work", "Burst smoothing/integration", "Duplicates, ordering, poison messages"]
        ]),
        check: { question: "Why can a streaming endpoint return useful output sooner without reducing total compute?", answer: "It exposes partial tokens as they are generated, improving time to first output while the full generation still runs." }
      },
      {
        id: "resilience",
        title: "Retries are load multipliers unless bounded by time and semantics",
        body: [
          "A timeout bounds how long a caller waits for a dependency. Connection and read timeouts should reflect the end-to-end deadline; a downstream call cannot consume more time than remains. Retry only transient failures and only operations safe to repeat. Exponential backoff with jitter spreads attempts; a maximum count and deadline cap total amplification.",
          "Idempotency ensures repeated requests do not create repeated effects. A client supplies an idempotency key; the service stores the completed or in-progress result for that key and returns it on retry. Model scoring without side effects is naturally repeatable, but logging charges, job creation, emails, or tool actions may not be. Exactly-once delivery is rarely available end to end; design effectively-once effects with deduplication and state transitions.",
          "Circuit breakers stop calls after repeated dependency failures, allowing recovery and fast failure. They complement—not replace—timeouts. Bulkheads isolate resources so one slow vendor or model cannot consume every worker."
        ],
        example: "An LLM vendor times out at 30 seconds while the API gateway deadline is 20. Three immediate retries hold connections and triple vendor load, ensuring more timeouts. Set a smaller per-attempt timeout, retry only before the remaining deadline with jitter, and use a circuit breaker/fallback or queued workflow where acceptable.",
        failure: "Retrying HTTP 400/422 wastes capacity because the request is invalid. Retrying a non-idempotent tool call can duplicate a payment or email. Classify failure before retrying.",
        check: { question: "What is the purpose of jitter in exponential backoff?", answer: "It prevents synchronized clients from retrying at the same moments and creating repeated traffic spikes." }
      },
      {
        id: "limits-errors",
        title: "Rate limits protect both fairness and saturation boundaries",
        body: [
          "Rate limiting constrains requests per identity, tenant, route, or token budget. A token-bucket design permits controlled bursts while limiting sustained rate. Concurrency limits cap simultaneous expensive work; queue limits cap waiting memory and latency. When saturated, reject quickly with 429 or 503 and retry guidance rather than accepting work that will expire unseen.",
          "Backpressure propagates capacity limits upstream. A bounded queue tells producers to slow or shed load. An unbounded queue converts a traffic spike into hours of stale predictions and memory risk. Priorities must be governed so low-priority work cannot starve permanently.",
          "Structured errors distinguish invalid input, policy denial, dependency timeout, model overload, and internal defect. Include correlation IDs and retryability, but not credentials or prompts. Measure retry attempts, abandoned requests, queue age, cancellation, and duplicate suppression."
        ],
        code: code("python", "async def call_vendor(payload, deadline):\n    key = payload.request_id\n    cached = await idempotency_store.get(key)\n    if cached is not None:\n        return cached\n    for attempt in range(3):\n        remaining = deadline - monotonic()\n        if remaining <= 0:\n            raise DeadlineExceeded()\n        try:\n            result = await client.predict(payload, timeout=min(2.0, remaining))\n            await idempotency_store.put_if_absent(key, result)\n            return result\n        except TransientUpstreamError:\n            await asyncio.sleep(min(jittered_backoff(attempt), max(0, remaining)))\n    raise UpstreamUnavailable()", [
          "The idempotency lookup happens before external work.",
          "Every attempt respects remaining end-to-end time.",
          "Only a classified transient error is retried.",
          "A conditional result write protects competing duplicate requests."
        ], "It prevents duplicate effects, unbounded retries, and downstream calls continuing after the user’s deadline."),
        check: { question: "Why is a bounded queue a reliability control?", answer: "It prevents unlimited memory and waiting-time growth and gives upstream systems a clear backpressure signal." }
      }
    ],
    glossary: [
      ["Synchronous", "Request waits for final completion."],
      ["Asynchronous job", "Request creates work completed and retrieved later."],
      ["Streaming", "Response delivers partial results incrementally."],
      ["Timeout", "Maximum allowed wait for an operation or phase."],
      ["Retry", "Repeated attempt after a classified failure."],
      ["Exponential backoff", "Increasing delay between retry attempts."],
      ["Jitter", "Random variation added to spread retries."],
      ["Idempotency", "Repeated identical operation has no additional intended effect."],
      ["Rate limiting", "Control on request frequency or resource consumption."],
      ["Backpressure", "Signal that downstream capacity is saturated."],
      ["Circuit breaker", "Temporary call suppression after sustained failures."],
      ["Bulkhead", "Resource isolation preventing one dependency from exhausting all capacity."]
    ],
    exercise: {
      duration: 35,
      title: "Design a resilient document-extraction API",
      brief: "Documents take 2–90 seconds, clients retry on network loss, and an external OCR provider has bursts of 503 errors.",
      parts: [
        "Choose job, streaming, or synchronous semantics and define statuses.",
        "Design idempotency keys and job state transitions.",
        "Allocate a deadline across OCR, LLM extraction, validation, and persistence.",
        "Set retry, circuit, concurrency, queue, and rate-limit policies; define observability fields."
      ],
      solution: "Use an async job with 202 and a stable job resource; optional progress events may stream separately. The client’s idempotency key maps retries to the same job. States should be accepted, running, succeeded, failed, or cancelled with atomic transitions. Bound OCR attempts by the job deadline, retry only transient 5xx/timeouts with jitter, trip a circuit during sustained outage, cap tenant and global concurrency, and reject when queue age would violate the objective. Log request/job IDs, attempt counts, dependency latency, state changes, duplicate hits, and redacted error classes."
    },
    sources: { core: ["fastapi","jsonSchema"], deep: ["otelContext"] },
    quiz: [
      { concept:"Interaction mode", prompt:"A nightly 10-million-row scoring job takes two hours. Which API pattern fits best?", answer:1, options:[
        ["Hold one synchronous mobile request for two hours.","Connections and client lifecycles make this brittle."],
        ["Create an asynchronous job resource and expose status/result.","Correct."],
        ["Return fake predictions immediately.","That violates correctness."],
        ["Use GET to mutate a hidden job repeatedly.","GET should not create side effects."]
      ]},
      { concept:"Streaming", prompt:"An LLM streams tokens before output validation finishes. What new risk appears?", answer:2, options:[
        ["Total model compute becomes zero.","Streaming changes delivery timing, not compute."],
        ["The request is automatically idempotent.","Idempotency needs separate design."],
        ["Unsafe or invalid partial content can reach the client before checks.","Correct. Use incremental moderation or buffered validated units."],
        ["The context window doubles.","Transport mode does not expand model capacity."]
      ]},
      { concept:"Timeouts", prompt:"The gateway deadline is 5 seconds, but a downstream call has a 30-second timeout. What is wrong?", answer:0, options:[
        ["Work can continue after the caller has given up, wasting capacity.","Correct. Propagate remaining deadline."],
        ["The downstream model becomes more accurate.","Timeout length does not guarantee quality."],
        ["HTTP 422 becomes success.","Status semantics are unchanged."],
        ["The call is necessarily cached.","No cache is described."]
      ]},
      { concept:"Retries", prompt:"A request fails schema validation with 422. Should the server retry the vendor call?", answer:3, options:[
        ["Yes, forever.","The input is invalid and will not heal."],
        ["Yes, exactly ten times.","Retry count does not change a permanent request defect."],
        ["Only after increasing temperature.","Sampling is irrelevant."],
        ["No; return the validation error so the client can correct it.","Correct."],
      ]},
      { concept:"Idempotency", prompt:"A client times out after submitting a batch job and retries. How do you prevent two jobs?", answer:1, options:[
        ["Use a random new key on every retry.","That prevents deduplication."],
        ["Persist a client-supplied idempotency key and return the existing job/result.","Correct."],
        ["Disable all timeouts.","That creates resource risk."],
        ["Return 200 before storing anything.","A crash can lose the work and state."]
      ]},
      { concept:"Backpressure", prompt:"An unbounded queue grows during a traffic spike. What happens even if no task is dropped?", answer:2, options:[
        ["Every task becomes faster.","Waiting time grows."],
        ["Memory and latency stay fixed.","Both can increase."],
        ["Predictions become stale and resource use can fail the service.","Correct. Bounded acceptance is safer."],
        ["Class prevalence becomes one.","Queue size does not change labels directly."]
      ]},
      { concept:"Circuit breaker", prompt:"A dependency fails continuously. What does an open circuit breaker do?", answer:0, options:[
        ["Fails calls quickly for a period instead of repeatedly loading the dependency.","Correct. It later probes recovery."],
        ["Trains a new model automatically.","Retraining is unrelated."],
        ["Makes requests exactly once globally.","It is not a transaction protocol."],
        ["Removes authentication.","Security remains."]
      ]}
    ]
  });

  register({
    id: 29,
    centralQuestion: "If an AI output is probabilistic, what can a test assert without becoming either brittle or meaningless?",
    objective: "Design unit, integration, data, model-behavior, API-contract, regression, and resilience tests using fixtures, fakes, mocks, tolerances, and production-like boundaries.",
    sections: [
      {
        id: "test-layers",
        title: "Different tests localize different failures",
        body: [
          "Unit tests isolate small deterministic logic: parsers, feature formulas, threshold decisions, and schema invariants. Integration tests exercise real boundaries such as artifact loading, database queries, vector indexes, or vendor-compatible sandboxes. End-to-end tests verify a representative request crosses authentication, validation, inference, persistence, and response serialization.",
          "Data tests validate schema, uniqueness, ranges, missingness, freshness, and statistical expectations. Model-behavior tests assert properties such as probability bounds, monotonic response for a controlled feature, invariance to safe formatting, and minimum performance on a fixed evaluation slice. API contract tests assert routes, statuses, schemas, compatibility, and error shapes.",
          "A pyramid of fast deterministic tests provides rapid feedback; fewer expensive integration and end-to-end tests cover composition. A hundred mocked tests can all pass while the real model format or vendor API is incompatible, so retain representative boundary tests."
        ],
        table: table("Test type and failure localized", ["Test", "Question", "Use real dependency?", "Typical assertion"], [
          ["Unit", "Is local logic correct?", "No", "Exact value/invariant"],
          ["Data", "Is input fit for use?", "Dataset/sample", "Schema/range/distribution"],
          ["Model behavior", "Does behavior meet properties?", "Real artifact", "Tolerance, metric, slice"],
          ["Integration", "Do components interoperate?", "Often yes", "Load/query/protocol"],
          ["Contract", "Can clients rely on interface?", "Route or schema", "Status and JSON shape"],
          ["End-to-end", "Does the workflow work?", "Production-like stack", "Outcome and trace"]
        ]),
        check: { question: "Why can an end-to-end failure be slow to diagnose without lower-level tests?", answer: "It proves the composed path failed but does not identify which transformation, adapter, artifact, or policy caused it." }
      },
      {
        id: "probabilistic",
        title: "Test invariants, distributions, and tolerances—not arbitrary exact floats",
        body: [
          "For deterministic preprocessing, exact outputs may be appropriate. Floating-point inference often needs a tolerance because hardware and optimized kernels can differ slightly. The tolerance must be smaller than a decision-relevant margin. If a tiny numeric difference crosses a threshold, add boundary tests and consider stable policy handling around the threshold.",
          "Stochastic generation should be tested with constrained seeds where supported plus rubric/distribution checks across repeated runs. Assert schema validity, prohibited content absence, tool-call allowlists, and quality rates rather than one exact paragraph. Golden responses are useful for detecting change but brittle as a sole truth source.",
          "Metamorphic tests change an input in a way with an expected relation: adding irrelevant whitespace should not reverse a classification; increasing a risk feature under a monotonic policy should not lower risk. These tests expose behavior even without a gold output for every case."
        ],
        example: "A risk model test asserts probability exactly 0.734281. A runtime upgrade yields 0.734279 and fails the build, although the decision and error tolerance are unchanged. Replace exact equality with a justified numerical tolerance, while separately asserting that examples near 0.70 receive stable, reviewed boundary behavior.",
        failure: "Setting a very wide tolerance so every candidate passes turns a flaky test into no test. Derive tolerance from numeric expectations and downstream decision sensitivity.",
        check: { question: "What should a stochastic structured-output test assert first?", answer: "That every allowed run conforms to the required schema and safety/tool constraints, then that quality rates meet thresholds across a representative set." }
      },
      {
        id: "fixtures-mocks",
        title: "Fakes simplify reality; contract tests reconnect it",
        body: [
          "A fixture supplies stable test data or setup. A fake implements simplified behavior, such as an in-memory repository. A mock records expected calls and can simulate failures. Patch the boundary your code uses, not a distant library symbol. Over-mocking internal calls locks tests to implementation and allows an imaginary vendor protocol to pass.",
          "Use dependency injection to supply fake clocks, scorers, stores, and clients. Keep representative sanitized fixtures with schema versions and edge cases. A contract test against the real external service or a provider-maintained emulator verifies authentication headers, serialization, pagination, and error behavior.",
          "Failure tests are first-class: timeouts, 429, partial batch failure, corrupt artifact, stale schema, duplicate message, and cancellation. Verify safe state, bounded retries, idempotency, and observability—not only returned text."
        ],
        code: code("python", "def test_prediction_contract(client, fake_service):\n    fake_service.result = {\n        \"probability\": 0.82, \"decision\": \"review\",\n        \"model_version\": \"risk-17\", \"policy_version\": \"p-4\",\n        \"request_id\": \"req-test\"\n    }\n    response = client.post(\"/v1/predictions\", json={\"age\": 42, \"balance_sar\": 900})\n    assert response.status_code == 200\n    assert response.json() == fake_service.result\n\ndef test_unknown_field_rejected(client):\n    response = client.post(\"/v1/predictions\",\n                           json={\"age\": 42, \"balance_sar\": 900, \"admin\": True})\n    assert response.status_code == 422", [
          "The fake isolates HTTP serialization from real inference cost.",
          "The exact response contract includes lineage fields.",
          "The adversarial unknown field verifies strict schema behavior."
        ], "It prevents an apparently successful route from silently accepting client drift or losing model/policy identity."),
        check: { question: "Why keep at least one real artifact-loading integration test?", answer: "A fake scorer cannot reveal serialization, runtime, feature-order, or dependency incompatibility in the real artifact." }
      }
    ],
    glossary: [
      ["Unit test", "Isolated test of a small component."],
      ["Integration test", "Test of interaction across real component boundaries."],
      ["Data test", "Assertion about data schema, quality, freshness, or distribution."],
      ["Model-behavior test", "Assertion about predictive properties or evaluated performance."],
      ["API contract test", "Test of routes, statuses, schemas, and compatibility."],
      ["Fixture", "Reusable stable test input or setup."],
      ["Fake", "Simplified working dependency implementation for tests."],
      ["Mock", "Controlled dependency substitute that records or asserts interactions."],
      ["Golden test", "Comparison against a previously accepted output."],
      ["Metamorphic test", "Assertion about how output should relate after a controlled input change."],
      ["Tolerance", "Permitted numerical difference justified by behavior and precision."]
    ],
    exercise: {
      duration: 35,
      title: "Build a layered test suite for a risk API",
      brief: "The service validates input, computes features, loads a model, calls a reference database, and returns a review decision.",
      parts: [
        "Write unit tests for three feature formulas and threshold boundary behavior.",
        "Write data/schema tests for nulls, ranges, freshness, and unknown categories.",
        "Write a real artifact integration test plus an API contract test with a fake scorer.",
        "Simulate database timeout and duplicate requests; assert retries, idempotency, state, and logs."
      ],
      solution: "Use exact assertions for deterministic transformations, small tolerances for real inference, and explicit cases just below/at/above threshold. Load the actual versioned pipeline against golden fixtures. The API fake verifies status and response shape but cannot replace the load test. A transient database timeout should retry within deadline; a permanent validation error should not. Duplicate idempotency keys return one stored result. Assert a correlation ID, error class, and attempt count without logging sensitive data."
    },
    sources: { core: ["pytest","fastapi","jsonSchema"], deep: ["sklearnPipeline"] },
    quiz: [
      { concept:"Unit tests", prompt:"Which target is best for a unit test?", answer:0, options:[
        ["A pure function computing a 30-day rolling feature from fixed inputs.","Correct. It can be isolated and exact."],
        ["The entire production network and vendor ecosystem.","That is integration/end-to-end scope."],
        ["A live GPU cluster failover.","That is a system resilience test."],
        ["Unbounded real customer traffic.","Tests need controlled, privacy-safe fixtures."]
      ]},
      { concept:"Integration tests", prompt:"A fake model passes, but the real artifact cannot deserialize under the production runtime. Which test was missing?", answer:2, options:[
        ["A CSS snapshot.","UI style does not load artifacts."],
        ["A precision definition quiz.","Knowledge questions do not verify runtime compatibility."],
        ["A real artifact-loading integration test in the release environment.","Correct."],
        ["A mock that always returns success.","That repeats the blind spot."]
      ]},
      { concept:"Behavior tests", prompt:"A model is required to return probabilities within [0,1]. What type of assertion is this?", answer:1, options:[
        ["A network routing test.","No network is involved."],
        ["A model-behavior invariant.","Correct."],
        ["A package lock.","Locks control dependencies."],
        ["An authorization role.","Permission is separate."]
      ]},
      { concept:"Tolerances", prompt:"A runtime change moves probability by 2e−6, far from any decision boundary. What is a robust test?", answer:3, options:[
        ["Require bit equality across all hardware.","This may be brittle without value."],
        ["Remove the prediction test.","Compatibility evidence is still needed."],
        ["Allow any value from −100 to 100.","That destroys the invariant."],
        ["Use a justified small tolerance plus separate boundary cases.","Correct."],
      ]},
      { concept:"Stochastic output", prompt:"A generative test expects one exact paragraph and fails on a correct paraphrase. What is better?", answer:0, options:[
        ["Assert schema, required facts/citations, prohibited content, and rubric quality across runs.","Correct."],
        ["Increase the exact paragraph length.","That remains brittle."],
        ["Disable all validation.","That removes protection."],
        ["Use production users as unlabeled tests.","That is unsafe and uninformative."]
      ]},
      { concept:"Mocking", prompt:"Every internal helper is mocked and tests break after a refactor with identical behavior. What is wrong?", answer:2, options:[
        ["There are too few mocks.","More would increase coupling."],
        ["The model needs higher recall.","This is test design."],
        ["Tests are coupled to implementation calls instead of public behavior/boundaries.","Correct."],
        ["Fixtures cannot contain data.","Fixtures are designed to provide data/setup."]
      ]},
      { concept:"Failure testing", prompt:"A queued worker receives the same message twice. What should the test verify?", answer:1, options:[
        ["Two payments are created.","That is the failure to prevent."],
        ["The idempotency/deduplication path produces one intended effect and traceable handling.","Correct."],
        ["The queue grows without bound.","Reliability requires bounded behavior."],
        ["The model retrains between deliveries.","Duplicate handling does not require retraining."]
      ]}
    ]
  });

  register({
    id: 30,
    centralQuestion: "How do you connect models, databases, vector stores, queues, and external AI services without trusting or coupling every boundary?",
    objective: "Design secure, observable, resilient integrations using authentication, authorization, secret stores, adapters, transactions/outbox, queues, validation, and containers as packaging boundaries.",
    sections: [
      {
        id: "trust-boundaries",
        title: "Every integration is both a failure boundary and a trust boundary",
        body: [
          "External AI services, relational databases, vector stores, object stores, and message brokers fail differently and expose different data. Wrap each behind an adapter that validates requests/responses, sets deadlines, classifies errors, and records dependency-specific telemetry. Do not let vendor response objects flow through the domain unchecked.",
          "Authentication establishes the caller or workload identity; authorization decides whether that identity may perform a particular action on a resource. API keys identify an application weakly and must be scoped where possible. Managed workload identity or short-lived tokens reduce static-secret exposure. Least privilege limits each service to the tables, indexes, models, queues, and operations it needs.",
          "Secrets belong in a secret manager and are injected at runtime, not committed, baked into container images, printed in logs, or returned in errors. Rotation requires the application to refresh credentials without unsafe downtime. Encryption in transit protects network data; encryption at rest protects stored media, but neither replaces access control."
        ],
        table: table("Integration boundary checklist", ["Boundary", "Validate", "Resilience", "Security"], [
          ["External model API", "Schema/model identity/content limits", "Timeout, retry, circuit", "Scoped identity; data minimization"],
          ["Relational DB", "Types/transaction invariants", "Pool bounds; transaction retry", "Parameterized queries; least-privilege role"],
          ["Vector store", "Dimension/model/filter semantics", "Index health; fallback", "Pre-retrieval ACL filters"],
          ["Queue", "Message schema/idempotency", "DLQ; retry; backpressure", "Producer/consumer permissions"],
          ["Object/model store", "Digest/manifest", "Cache and atomic load", "Signed provenance; read-only serving access"]
        ]),
        check: { question: "Why is an API key not a substitute for authorization?", answer: "It may identify a caller, but a separate policy must decide which resources and actions that identity is allowed to use." }
      },
      {
        id: "data-integrations",
        title: "Databases, vector stores, and queues preserve different invariants",
        body: [
          "Relational databases provide transactions for related state changes. Use parameterized queries to prevent injection and bounded connection pools to prevent saturation. Keep transactions short; do not hold a database lock while waiting for an LLM. If a decision record and message must stay consistent, the transactional outbox writes both business state and an outbound-event row in one transaction, then a publisher delivers the event with idempotent consumption.",
          "Vector stores require embedding-dimension and model-version compatibility. Metadata filtering should enforce tenant and document access before vectors or text leave the store. Approximate search can trade recall for latency; treat index parameters as versioned configuration.",
          "Queues support asynchronous decoupling and at-least-once delivery. Consumers must tolerate duplicates, define ordering scope, move poison messages to a dead-letter queue after bounded attempts, and expose queue age. Acknowledging before durable processing risks loss; acknowledging after effects without idempotency risks duplication on crash."
        ],
        diagram: diagram("flow", "Transactional outbox integration", ["DB transaction", "Decision row", "Outbox row", "Publisher", "Idempotent consumer"], [[0,1],[0,2],[2,3],[3,4]], "Business state and intent-to-publish commit together; delivery may repeat, so consumers deduplicate."),
        failure: "Calling an LLM inside a database transaction extends lock time and couples unpredictable network latency to database availability. Read required state, release the transaction, call externally, then write under an explicit concurrency/version check.",
        check: { question: "Why does at-least-once queue delivery require idempotent consumers?", answer: "A crash or acknowledgement loss can cause redelivery after an effect occurred; deduplication prevents repeated business effects." }
      },
      {
        id: "containers",
        title: "A container packages the process; policy still surrounds it",
        body: [
          "A container image packages application code, runtime, libraries, and filesystem configuration into immutable layers. A container is a running isolated process created from that image. Packaging improves environment consistency and delivery, but it does not create a complete security boundary or make external dependencies reproducible.",
          "Build from a small pinned base image, install locked dependencies, run as a non-root user, keep secrets out of layers, and scan images. Use read-only filesystems and drop capabilities when possible. Configuration and credentials enter at runtime. Record the image digest alongside model and config versions.",
          "One image may contain the API application while model artifacts are fetched from a trusted registry at startup; alternatively the artifact is baked in for atomicity at the cost of larger builds. Choose based on release coupling, size, and rollback, then verify the exact bundle before readiness."
        ],
        code: code("dockerfile", "FROM python:3.12-slim@sha256:<reviewed-digest>\nWORKDIR /app\nCOPY requirements.lock ./\nRUN pip install --no-cache-dir --require-hashes -r requirements.lock\nCOPY src/ ./src/\nRUN useradd --create-home --uid 10001 appuser\nUSER 10001\nENV PYTHONUNBUFFERED=1\nCMD [\"python\", \"-m\", \"src.api\"]", [
          "The base image is addressed immutably rather than by a moving tag alone.",
          "Hash-locked installs detect dependency substitution.",
          "Application source is copied after dependencies so build cache remains useful.",
          "The process runs without root privileges and contains no embedded secret."
        ], "It reduces mutable runtime drift, supply-chain ambiguity, and the impact of process compromise."),
        check: { question: "Why is a secret passed with `ENV API_KEY=...` during image build unsafe?", answer: "Build instructions and layers can retain the value in image history or caches; inject secrets only at runtime from a controlled store." }
      },
      {
        id: "resilient-composition",
        title: "Compose failure policies around the end-to-end objective",
        body: [
          "A request may call identity, features, vector search, an LLM, a database, and a queue. Give it one correlation ID and end-to-end deadline. Allocate smaller budgets to dependencies, propagate trace context, and never let nested retries multiply unchecked. Decide which failures permit cached data, partial answers, abstention, queued completion, or immediate denial.",
          "Fallbacks must preserve semantics. Falling back from an unavailable approved model to an ungoverned public model can violate privacy and policy. Returning stale embeddings may be acceptable for a low-risk FAQ but not a revoked entitlement. Document degradation modes and make them visible in responses and metrics.",
          "Threat-model payloads in both directions. Validate tool arguments produced by an LLM, sanitize parameterized database calls, treat retrieved text as untrusted, and cap response sizes. Observability should identify which boundary failed without exposing the sensitive content that crossed it."
        ],
        consequence: "Resilience without semantic controls can make an unsafe system highly available. The best fallback may be an explicit abstention or delayed workflow rather than a lower-quality answer.",
        check: { question: "Why should nested SDK retries often be disabled or coordinated?", answer: "If every layer retries independently, attempt counts multiply, deadlines are exceeded, and an outage receives more load." }
      }
    ],
    glossary: [
      ["Authentication", "Verification of a user or workload identity."],
      ["Authorization", "Decision that an identity may perform an action on a resource."],
      ["Least privilege", "Granting only permissions required for the task."],
      ["Secret store", "Controlled service for storing and rotating credentials."],
      ["Parameterized query", "Database query separating code from untrusted values."],
      ["Transaction", "Atomic group of database state changes."],
      ["Transactional outbox", "Pattern committing business state and an event-to-publish together."],
      ["Dead-letter queue", "Destination for messages that exceed retry policy."],
      ["Container image", "Immutable layered package for an application process."],
      ["Container", "Running isolated process instantiated from an image."],
      ["Correlation ID", "Identifier connecting events across a distributed request."],
      ["Graceful degradation", "Reduced capability that preserves declared safety and semantics."]
    ],
    exercise: {
      duration: 90,
      title: "Architecture review of a tool-using RAG service",
      brief: "The service reads tenant documents, calls an external LLM, writes case state, and publishes follow-up work. It currently uses one admin key and retries everything five times.",
      parts: [
        "Draw trust/failure boundaries and assign workload/user identities and least-privilege roles.",
        "Specify request/response schemas and pre-retrieval authorization filters.",
        "Use a transaction/outbox plus idempotent queue consumer for state and follow-up.",
        "Allocate deadlines, retries, circuit breakers, queue limits, and safe degradation modes.",
        "Write the container security checklist and complete the D3 domain exam."
      ],
      solution: "Separate user authorization from workload authentication. The retrieval adapter filters tenant/status before content leaves the store; the LLM receives minimized data. Validate model output and tool arguments. Write case state and outbox intent in one short transaction, publish asynchronously, and deduplicate by event ID. Retry only transient idempotent calls within the propagated deadline; coordinate SDK retries and trip circuits. If the approved LLM is unavailable, queue or abstain rather than use an unapproved provider. Build a pinned non-root image, inject rotating secrets at runtime, and trace IDs/versions without raw documents."
    },
    sources: { core: ["dockerImages","dockerfile","fastapi","otelContext"], deep: ["owaspLLM","jsonSchema"] },
    quiz: [
      { concept:"Authentication vs authorization", prompt:"A service account presents a valid token but requests another tenant’s vector index. What control must deny it?", answer:1, options:[
        ["Authentication only, because the token is valid.","Identity is already established."],
        ["Authorization scoped to the requested tenant/index.","Correct."],
        ["A higher similarity threshold.","Retrieval quality is not access control."],
        ["More retry attempts.","Retries repeat the forbidden action."]
      ]},
      { concept:"Secrets", prompt:"An API key is copied into a Dockerfile `ENV` instruction. Why rotate and rebuild immediately?", answer:0, options:[
        ["The secret may persist in image layers/history and anyone with image access may recover it.","Correct."],
        ["Docker automatically publishes every environment value on the internet.","Not automatically, but image access is enough risk."],
        ["The model loses its labels.","Credentials do not alter labels."],
        ["The key becomes an embedding.","It remains secret text/bytes."]
      ]},
      { concept:"Database integration", prompt:"Why use parameterized SQL for user-supplied filters?", answer:2, options:[
        ["It guarantees zero latency.","Queries still consume resources."],
        ["It makes every query read-only.","Permissions and statement determine that."],
        ["It separates query structure from values, reducing injection risk.","Correct."],
        ["It replaces authorization.","A safe query can still access forbidden data."]
      ]},
      { concept:"Outbox", prompt:"A transaction writes a decision, then the process crashes before publishing its event. Which pattern prevents silent inconsistency?", answer:3, options:[
        ["Publish first with no identifier.","A later DB failure causes the inverse inconsistency."],
        ["Hold a database lock while waiting forever.","That harms availability."],
        ["Ask the model to remember the event.","Model memory is not durable messaging."],
        ["Commit an outbox row with the decision, then publish it asynchronously.","Correct."],
      ]},
      { concept:"Queue delivery", prompt:"A consumer performs an effect, crashes before acknowledgement, and receives the message again. What prevents duplication?", answer:1, options:[
        ["An unbounded queue.","That worsens overload."],
        ["An idempotency key/state check around the effect.","Correct."],
        ["A random model version.","Versioning does not deduplicate."],
        ["Removing message IDs.","Identifiers enable deduplication."]
      ]},
      { concept:"Vector store contract", prompt:"Documents are embedded at dimension 768; queries arrive from a 1,536-dimension model. What should happen?", answer:0, options:[
        ["Reject the mismatch and use a compatible versioned index/query encoder.","Correct."],
        ["Silently truncate query dimensions.","That creates meaningless geometry."],
        ["Pad documents with labels.","Labels do not align spaces."],
        ["Increase top-k until it works.","Candidate count cannot repair dimensional/model incompatibility."]
      ]},
      { concept:"Containers", prompt:"Which statement about containers is accurate?", answer:2, options:[
        ["They reproduce every external service and hardware behavior.","They package only part of the environment."],
        ["They are immutable running processes.","Images are immutable packages; containers have runtime state."],
        ["An image packages userspace; a container is a running isolated process from it.","Correct."],
        ["They remove the need for least privilege.","Container processes still require security controls."]
      ]},
      { concept:"Nested retries", prompt:"Gateway, service, SDK, and vendor client each retry three times. What risk emerges?", answer:1, options:[
        ["At most three downstream attempts total.","Retries can multiply across layers."],
        ["Attempt amplification, deadline overruns, and extra load during outage.","Correct. Coordinate one retry policy."],
        ["Guaranteed success without cost.","Persistent failures worsen."],
        ["Automatic transaction rollback everywhere.","Retries do not create distributed transactions."]
      ]},
      { concept:"Graceful degradation", prompt:"The approved private LLM is unavailable. Is routing sensitive prompts to an unapproved public model graceful degradation?", answer:3, options:[
        ["Yes, any answer is better than delay.","Privacy and policy can be violated."],
        ["Yes, if temperature is zero.","Sampling does not approve data transfer."],
        ["Yes, if logs are deleted.","Deleting audit evidence does not make the provider safe."],
        ["No; queue, abstain, or use an explicitly approved fallback with equivalent controls.","Correct."],
      ]},
      { concept:"Observability", prompt:"A request crosses five services. What connects their logs and traces without logging the raw document?", answer:0, options:[
        ["A propagated correlation/trace ID plus version and timing fields.","Correct."],
        ["The full secret in every message.","That creates exposure."],
        ["A different random ID at each hop with no parent.","That prevents correlation."],
        ["Only the final HTTP status.","It cannot localize dependency failures."]
      ]}
    ]
  });
})();
