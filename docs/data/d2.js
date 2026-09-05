(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 13,
    centralQuestion: "A prediction is wrong. Which weights should move, in which direction, and by how much?",
    objective: "Trace a neural network from feature vector through affine layers and activations to loss, gradients, backpropagation, and a parameter update; explain batches, epochs, and learning rate causally.",
    sections: [
      {
        id: "forward",
        title: "Layers turn parameters into a differentiable hypothesis",
        body: [
          "A neuron computes an affine combination z = w·x + b, then often applies an activation a = φ(z). Weights determine how inputs influence the unit; bias shifts the activation threshold. A layer evaluates many such units in parallel. Stacking layers composes transformations, allowing later units to use representations built by earlier ones.",
          "Without nonlinear activations, any stack of affine layers collapses to one affine transformation and cannot express nonlinear boundaries. ReLU preserves positive inputs and zeros negative ones; sigmoid maps to (0,1); tanh maps to (−1,1). Output activation and loss must match the task. Binary logits commonly pair with binary cross-entropy computed stably from logits rather than applying a sigmoid manually twice.",
          "The forward pass evaluates the current parameters. It does not learn. Learning begins when a loss compares predictions with targets and a gradient describes how an infinitesimal parameter change would alter that loss."
        ],
        table: table("Component and causal role", ["Component", "Role", "If chosen poorly"], [
          ["Weight", "Scales and mixes input influence", "Weak or unstable representation"],
          ["Bias", "Offsets activation threshold", "Boundary forced through origin"],
          ["Activation", "Adds nonlinearity and gradient behavior", "Collapsed expressiveness or saturated gradients"],
          ["Loss", "Defines what training rewards", "Model optimizes the wrong error"],
          ["Output layer", "Maps representation to task output", "Incompatible shape or probability semantics"]
        ]),
        check: { question: "Why do ten linear layers without nonlinear activations remain equivalent to one linear layer?", answer: "A composition of affine transformations is another affine transformation, so depth adds parameterization but no new function class." }
      },
      {
        id: "backprop",
        title: "Backpropagation applies the chain rule through the computation graph",
        body: [
          "Backpropagation starts from the derivative of loss with respect to the output and propagates sensitivity backward. For a parameter deep in the network, the chain rule multiplies local derivatives along every path from that parameter to the loss. Automatic differentiation records the forward computation graph and computes these vector–Jacobian products efficiently.",
          "A gradient is not the parameter update. Gradient descent chooses an update such as θ ← θ − η∇θL, where η is the learning rate. The negative sign moves locally downhill. A very small η makes slow progress; a large η can overshoot valleys or diverge. The gradient depends on the current batch, so mini-batch training introduces noise that can help exploration but makes loss curves irregular.",
          "Gradients accumulate in PyTorch unless cleared. The canonical loop zeroes existing gradients, performs a forward pass, computes loss, calls backward, and steps the optimizer. Evaluation uses inference mode and disables training-specific behavior such as dropout updates."
        ],
        diagram: diagram("cycle", "Neural network training loop", ["Mini-batch", "Forward pass", "Loss", "Backprop gradients", "Optimizer update"], [[0,1],[1,2],[2,3],[3,4],[4,0]], "An epoch completes when the loop has consumed the training dataset once."),
        code: code("python", "model.train()\nfor x_batch, y_batch in train_loader:\n    optimizer.zero_grad()\n    logits = model(x_batch)\n    loss = loss_fn(logits, y_batch)\n    loss.backward()\n    optimizer.step()\n\nmodel.eval()\nwith torch.inference_mode():\n    valid_logits = model(x_valid)\n    valid_loss = loss_fn(valid_logits, y_valid)", [
          "`zero_grad` prevents gradients from unintended accumulation across batches.",
          "`backward` computes gradients; it does not modify parameters.",
          "`step` applies the optimizer’s update rule.",
          "Evaluation mode disables training-only layer behavior and gradient tracking."
        ], "It prevents stale gradients and training-mode dropout or normalization behavior from corrupting validation."),
        check: { question: "What happens if `optimizer.step()` is called before `loss.backward()`?", answer: "The optimizer has no current loss gradients to apply, so parameters use stale/empty gradients rather than the present batch’s error." }
      },
      {
        id: "batch-epoch",
        title: "Batch size changes both the estimate and the system",
        body: [
          "An epoch is one pass through the training set. A batch is the set used for one gradient estimate; a mini-batch lies between one-example stochastic updates and a full-dataset update. Small batches create noisier gradients and more parameter updates per epoch. Large batches improve accelerator utilization and stabilize estimates but consume more memory and may require learning-rate adjustment.",
          "Batch size also interacts with batch normalization, data order, and distributed training. A numerically larger batch is not automatically more informative if it contains near-duplicates. Shuffle independent examples for ordinary training, but preserve sequence semantics when the model or sampler requires them.",
          "The number of epochs is not a comparable unit across changing dataset sizes: doubling data doubles examples processed per epoch. Track optimizer steps and examples/tokens seen alongside epochs. Validation should run at meaningful intervals and use a separate mode and split."
        ],
        example: "A team doubles batch size from 64 to 1,024 to use a GPU. Steps per epoch fall sixteen-fold. If learning rate and number of epochs stay fixed, optimization follows fewer, less noisy updates and may reach a different basin. The throughput gain must be evaluated against convergence per example and validation quality, not just seconds per epoch.",
        consequence: "Changing batch size can alter memory use, throughput, gradient noise, and effective optimization schedule. It is a model and systems change, not only a performance setting.",
        check: { question: "Why should tokens or examples seen be logged in addition to epochs?", answer: "Epoch duration and update count change with dataset and batch size, while examples/tokens provide a comparable measure of training exposure." }
      }
    ],
    glossary: [
      ["Neuron", "Affine combination of inputs, commonly followed by an activation."],
      ["Weight", "Learned parameter controlling input influence."],
      ["Bias", "Learned offset in an affine transformation."],
      ["Activation", "Usually nonlinear function applied to a unit or layer output."],
      ["Forward pass", "Computation of outputs from inputs with current parameters."],
      ["Loss", "Scalar training objective measuring prediction error or preference."],
      ["Gradient", "Derivative of loss with respect to a parameter."],
      ["Backpropagation", "Efficient chain-rule computation of gradients through a graph."],
      ["Batch", "Examples used to estimate one parameter update."],
      ["Epoch", "One pass through the training dataset."],
      ["Learning rate", "Scale applied to an optimizer update."]
    ],
    exercise: {
      duration: 35,
      title: "Trace one binary update by hand and in PyTorch",
      brief: "Use two input features, one hidden ReLU unit, and one output logit for a single labeled example.",
      parts: [
        "Compute z, activation, logit, sigmoid probability, and binary cross-entropy.",
        "Use the chain rule to determine the sign of each weight gradient.",
        "Implement the same network and inspect `.grad` after `backward()`.",
        "Change learning rate by 100× and explain the next-step loss behavior."
      ],
      solution: "Write every intermediate value and local derivative. For a positive target with probability below one, the output logit gradient is negative, so descent increases combinations that raise the logit. ReLU blocks gradients when its pre-activation is negative. Confirm PyTorch gradients match signs and magnitudes. A 100× learning-rate increase can cross the local minimum or activate different ReLU regions, so a directionally correct gradient may still produce a worse next loss."
    },
    sources: { core: ["pytorchNN","pytorchOptim"], deep: ["googleML"] },
    quiz: [
      { concept:"Nonlinearity", prompt:"A network stacks five dense layers but uses no activation between them. What function class does the stack represent?", answer:1, options:[
        ["An arbitrary nonlinear function.","No nonlinearity exists to create curved boundaries."],
        ["A single affine transformation in an over-parameterized form.","Correct. Affine compositions collapse."],
        ["A recurrent sequence model.","Recurrence requires state connections, not mere depth."],
        ["A calibrated probability by definition.","Architecture does not guarantee calibration."]
      ]},
      { concept:"Backpropagation", prompt:"What does `loss.backward()` do in PyTorch?", answer:2, options:[
        ["It loads the next mini-batch.","The data loader handles batching."],
        ["It updates weights immediately.","The optimizer step applies updates."],
        ["It computes gradients of loss with respect to graph parameters.","Correct. Gradients are stored for the optimizer."],
        ["It switches the model to evaluation mode.","`model.eval()` changes mode."]
      ]},
      { concept:"Gradient descent", prompt:"A scalar parameter has gradient +4 and learning rate 0.1. Plain gradient descent changes it by what amount?", answer:0, options:[
        ["−0.4","Correct. The update subtracts learning rate times gradient."],
        ["+0.4","That moves uphill locally."],
        ["−4.1","The operation is multiplication, not subtraction of learning rate."],
        ["No change","A nonzero gradient produces an update."]
      ]},
      { concept:"Gradient accumulation", prompt:"Training omits `zero_grad()` between mini-batches. What happens by default?", answer:3, options:[
        ["The model becomes deterministic.","Gradient clearing is unrelated to sampling determinism."],
        ["Loss is automatically averaged across epochs.","The loss function decides reduction."],
        ["Parameters are frozen.","They can still update."],
        ["New gradients add to previous gradients, changing the intended update.","Correct. Accumulation is useful only when deliberate."]
      ]},
      { concept:"Learning rate", prompt:"Loss alternates wildly and grows after each update. Which first optimization hypothesis is most plausible?", answer:1, options:[
        ["The learning rate is necessarily too small.","Too-small rates usually cause slow progress, not explosive oscillation."],
        ["The learning rate may be overshooting stable regions.","Correct. Reduce it and inspect gradients and scaling."],
        ["The labels became nominal.","Label semantics are not implied by oscillating loss."],
        ["The test set is too large.","Test size does not drive training updates."]
      ]},
      { concept:"Batch size", prompt:"Batch size increases 16× while data size and epochs stay fixed. Which statement is true?", answer:2, options:[
        ["There are 16× more updates per epoch.","There are roughly 16× fewer."],
        ["Memory use must decrease.","Larger activations usually require more memory."],
        ["Updates per epoch fall and gradient estimates become less noisy.","Correct, all else equal."],
        ["Generalization is guaranteed to improve.","Optimization and generalization must be validated."]
      ]},
      { concept:"Train/eval mode", prompt:"A model with dropout is validated while still in training mode. What is the main problem?", answer:0, options:[
        ["Random unit dropping continues, making validation inconsistent with inference.","Correct. Evaluation mode changes dropout behavior."],
        ["Backpropagation becomes impossible forever.","Mode can be switched back for training."],
        ["The output layer disappears.","Dropout masks activations; it does not remove model definitions."],
        ["Labels are leaked into features.","This is mode skew, not label leakage."]
      ]}
    ]
  });

  register({
    id: 14,
    centralQuestion: "If gradients vanish, explode, or point noisily, should you change the optimizer, initialization, schedule, or network?",
    objective: "Compare SGD, momentum, and Adam; diagnose learning-rate, initialization, vanishing-gradient, and exploding-gradient failures; design a controlled optimization response.",
    sections: [
      {
        id: "optimizers",
        title: "Optimizers transform gradients into trajectories",
        body: [
          "Stochastic gradient descent applies the current mini-batch gradient. Its noise can help move through the loss landscape, but progress may zigzag along steep narrow directions. Momentum maintains an exponentially weighted velocity, accumulating consistent directions and damping oscillation. It can cross shallow local irregularities but may overshoot when learning rate or momentum is too high.",
          "Adam maintains moving estimates of first and second gradient moments and scales updates coordinate-wise. It often trains quickly with limited tuning, especially for sparse or differently scaled gradients. Adam’s fast optimization does not guarantee the best generalization; SGD with momentum can sometimes produce better final validation. Weight decay should be implemented deliberately—AdamW decouples decay from the adaptive gradient update.",
          "Optimizer comparisons require equal data order, model initialization, training budget, and evaluation. A lower training loss after ten minutes may reflect more updates per second rather than a better final solution."
        ],
        table: table("Optimizer mechanisms", ["Optimizer", "Memory", "Strength", "Typical risk"], [
          ["SGD", "Current gradient", "Simple, interpretable updates", "Slow or oscillatory"],
          ["Momentum", "Velocity / first moment", "Accelerates consistent direction", "Overshoot"],
          ["Adam", "First and second moments", "Adaptive per-parameter steps", "Can settle at different generalization; decay confusion"],
          ["AdamW", "Adam moments + decoupled decay", "Cleaner weight-decay behavior", "Still needs schedule and validation"]
        ]),
        check: { question: "What does momentum do when successive gradients point in a consistent direction?", answer: "It accumulates velocity in that direction, increasing effective progress while smoothing contradictory mini-batch noise." }
      },
      {
        id: "gradient-pathologies",
        title: "Depth turns local derivatives into multiplicative risk",
        body: [
          "Backpropagation multiplies local derivatives through many layers or time steps. If typical magnitudes are below one, early gradients can vanish; parameters near the input receive little learning signal. If products exceed one, gradients can explode, causing unstable updates, NaNs, and sensitivity to batches. Saturated sigmoid/tanh units contribute derivatives near zero; recurrent networks repeatedly multiply through time.",
          "Initialization controls activation and gradient scale at the start. Xavier-style initialization targets variance stability for tanh-like networks; He initialization accounts for ReLU’s inactive half. Residual connections provide shorter gradient paths. Normalization can stabilize activation distributions. LSTM and GRU gates create controlled memory paths for sequences. Gradient clipping limits update magnitude during spikes but does not cure a systematically poor architecture.",
          "Diagnose with per-layer gradient norms, activation distributions, loss finiteness, and update-to-weight ratios. If early-layer norms are nearly zero while late layers learn, suspect vanishing paths. If norms spike before NaNs, reduce learning rate, inspect inputs, and clip while fixing the root cause."
        ],
        example: "A 40-layer sigmoid network has healthy output-layer gradients but almost zero norms in its first blocks. Increasing learning rate makes later layers unstable before early layers learn. ReLU-family activations, variance-aware initialization, residual paths, and normalization address signal propagation; a global learning-rate increase does not.",
        failure: "Gradient clipping can make the loss finite while leaving the model unable to learn long dependencies. Treat it as a safety rail and measure whether the underlying gradient distribution remains pathological.",
        check: { question: "Why can simply raising the learning rate fail to repair vanishing gradients?", answer: "It scales all updates; later layers with healthy gradients may become unstable while early layers still receive negligible signal." }
      },
      {
        id: "schedules",
        title: "A learning-rate schedule allocates exploration and refinement",
        body: [
          "A high early learning rate can traverse the landscape quickly; a lower later rate refines parameters near a useful region. Step decay reduces at milestones, cosine schedules decrease smoothly, and plateau schedules react when validation stops improving. Warmup begins with small rates and rises, protecting large or normalization-sensitive models from unstable early updates.",
          "Schedules are measured in steps or epochs, so batch-size changes alter their meaning. If a cosine cycle spans 10,000 steps and batch size doubles, the model sees twice as many examples before the same schedule point unless adjusted. Log the actual rate per step and tokens or examples processed.",
          "Optimization stops when validation and operational metrics cease improving within a budget, not when training loss is aesthetically smooth. Repeat important comparisons across seeds because stochastic initialization and batch order can produce different outcomes."
        ],
        code: code("python", "optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)\nscheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=steps)\n\nfor batch in loader:\n    optimizer.zero_grad(set_to_none=True)\n    loss = loss_fn(model(batch[0]), batch[1])\n    loss.backward()\n    grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n    optimizer.step()\n    scheduler.step()\n    tracker.log({\"loss\": loss.item(), \"grad_norm\": float(grad_norm),\n                 \"lr\": scheduler.get_last_lr()[0]})", [
          "AdamW keeps weight decay separate from adaptive gradient scaling.",
          "Clipping returns the pre-clipped norm so pathology remains observable.",
          "The schedule advances per optimizer step and the realized rate is logged."
        ], "It prevents silent exploding updates and makes schedule/batch interactions reconstructable."),
        check: { question: "Why is warmup useful at the beginning of some large-model runs?", answer: "Moment estimates, activations, and normalization statistics are initially unstable; small early steps reduce destructive updates before the training dynamics settle." }
      }
    ],
    glossary: [
      ["SGD", "Mini-batch gradient descent update without adaptive moments."],
      ["Momentum", "Velocity that accumulates past gradient direction."],
      ["Adam", "Optimizer using adaptive first- and second-moment estimates."],
      ["AdamW", "Adam with decoupled weight decay."],
      ["Vanishing gradient", "Backpropagated signal shrinking toward zero in earlier layers or steps."],
      ["Exploding gradient", "Backpropagated signal growing to unstable magnitude."],
      ["Gradient clipping", "Limiting gradient norm or values before an update."],
      ["Initialization", "Rule setting parameters before learning begins."],
      ["Warmup", "Initial phase that gradually raises learning rate."],
      ["Learning-rate schedule", "Rule changing learning rate over training."]
    ],
    exercise: {
      duration: 35,
      title: "Diagnose an unstable sequence training run",
      brief: "Loss falls for 500 steps, spikes to NaN, and early recurrent-layer gradients vary from 1e−8 to 1e3.",
      parts: [
        "Instrument per-layer activation, gradient norm, update ratio, learning rate, and batch identity.",
        "Compare SGD+momentum and AdamW under the same seed and budget.",
        "Test clipping, a lower rate, warmup, and a gated recurrent architecture one at a time.",
        "Explain which change is containment and which addresses the long-path mechanism."
      ],
      solution: "First preserve the failing batch and confirm input scale and finite loss. Clip gradients to contain spikes and lower/warm the rate to avoid destructive updates. If gradients still vanish through time, replace plain recurrence with LSTM/GRU or shorten dependencies; this changes the propagation path. Optimizer changes can improve trajectory but do not guarantee long-memory learning. Compare validation sequence performance and gradient distributions across seeds, not only whether NaNs disappear."
    },
    sources: { core: ["pytorchOptim","pytorchNN"], deep: ["attentionPaper"] },
    quiz: [
      { concept:"Momentum", prompt:"Mini-batch gradients oscillate left-right across a narrow valley but consistently point forward. Why can momentum help?", answer:1, options:[
        ["It deletes the loss landscape.","The landscape is unchanged."],
        ["It accumulates the consistent component and damps alternating motion.","Correct. Velocity smooths noisy directions."],
        ["It guarantees global optimality.","No first-order optimizer guarantees that for deep networks."],
        ["It turns the task into regression.","Optimizer choice does not change task type."]
      ]},
      { concept:"Adam", prompt:"Which statement best characterizes Adam?", answer:3, options:[
        ["It uses one fixed step for every parameter regardless of history.","Adam adapts coordinate-wise using moments."],
        ["It cannot train sparse models.","Adaptive updates often work well with sparse gradients."],
        ["It always generalizes better than SGD.","Final generalization is empirical."],
        ["It scales updates using moving estimates of gradient mean and squared magnitude.","Correct."],
      ]},
      { concept:"Vanishing gradients", prompt:"Early layers have gradient norms near zero while the classifier head changes rapidly. Which mechanism fits?", answer:0, options:[
        ["Products of small local derivatives attenuate signal backward.","Correct. This is the classic vanishing-gradient path."],
        ["The test set is too representative.","Evaluation composition does not create layerwise gradients."],
        ["Gradient clipping is too weak by definition.","Clipping controls large, not tiny, gradients."],
        ["The batch size is exactly optimal.","Nothing supports that claim."]
      ]},
      { concept:"Exploding gradients", prompt:"Gradient norms spike immediately before NaN losses. What is the safest first containment step while investigating?", answer:2, options:[
        ["Increase learning rate tenfold.","That amplifies unstable updates."],
        ["Ignore nonfinite loss and continue.","Parameters may become irrecoverable."],
        ["Clip norms, reduce rate, preserve the failing batch, and inspect inputs/architecture.","Correct. This contains damage and supports diagnosis."],
        ["Fit on validation data.","That leaks and does not fix instability."]
      ]},
      { concept:"Initialization", prompt:"Why is He initialization commonly paired with ReLU networks?", answer:1, options:[
        ["It forces every activation to one.","That would destroy representation."],
        ["It accounts for variance lost when many ReLU activations are zero.","Correct. It aims to stabilize signal scale across layers."],
        ["It eliminates the need for data.","Initialization only sets starting parameters."],
        ["It calibrates final probabilities.","Calibration is a separate evaluation/fitting task."]
      ]},
      { concept:"Schedules", prompt:"Batch size doubles, but a step-based schedule is unchanged. What must be reconsidered?", answer:0, options:[
        ["How many examples are seen before each learning-rate point.","Correct. Steps now cover more data."],
        ["Whether labels are categorical.","Batch size does not change label semantics."],
        ["Whether the model has an output layer.","Architecture is unchanged."],
        ["Whether AUC becomes accuracy.","Metrics do not transform this way."]
      ]},
      { concept:"Gradient clipping", prompt:"Clipping prevents NaNs but long-sequence accuracy remains at chance. What is the best interpretation?", answer:2, options:[
        ["The problem is solved because training is finite.","Numerical containment is not task learning."],
        ["Clipping guarantees memory across time.","It cannot create a gated memory path."],
        ["Explosions were contained, but vanishing or representation limits may remain.","Correct. Inspect gradients and architecture."],
        ["Chance accuracy proves perfect calibration.","Random discrimination does not imply useful calibration."]
      ]}
    ]
  });

  register({
    id: 15,
    centralQuestion: "If a deep network can memorize every training example, which constraints improve transfer without blocking learning?",
    objective: "Combine dropout, weight decay, early stopping, batch normalization, augmentation, and capacity control; distinguish their mechanisms and predict train/evaluation behavior.",
    sections: [
      {
        id: "regularizers",
        title: "Different regularizers break different shortcuts",
        body: [
          "Weight decay continuously shrinks parameters during optimization, discouraging solutions dependent on large weights. Dropout randomly zeros selected activations during training and rescales the survivors; units cannot rely on one fixed coalition, which can reduce co-adaptation. At inference, dropout is disabled and the deterministic scaled network is used.",
          "Early stopping limits training exposure based on validation behavior. Data augmentation encodes invariances by generating label-preserving transformations—small image crops may be valid, vertical flips of digits may not. Reducing width, depth, or sequence length directly limits representational capacity. These methods are not interchangeable: augmentation adds prior knowledge about inputs, while weight decay changes parameter preference.",
          "Training loss often worsens under a useful regularizer. The desired signature is better or more stable held-out performance, not minimal training error. Excessive dropout or decay causes underfit; insufficient constraints leave the train-validation gap."
        ],
        table: table("Deep-network regularization mechanisms", ["Technique", "Mechanism", "Train-time behavior", "Failure if excessive"], [
          ["Weight decay", "Shrink parameters", "Adds update pressure", "High bias"],
          ["Dropout", "Random activation masks", "Noisy subnetworks", "Information loss / slow fit"],
          ["Early stopping", "Limits optimization steps", "Selects checkpoint", "Stops before signal learned"],
          ["Augmentation", "Adds invariant examples", "Changes data distribution", "Invalid labels or unrealistic inputs"],
          ["Capacity reduction", "Restricts function class", "Lower train fit", "Underfitting"]
        ]),
        check: { question: "Why can stronger regularization increase training loss while improving validation?", answer: "It prevents the model from exploiting training-specific detail, sacrificing in-sample fit for lower variance on unseen cases." }
      },
      {
        id: "batchnorm",
        title: "Batch normalization stabilizes optimization and creates mode state",
        body: [
          "Batch normalization standardizes intermediate activations using mini-batch statistics during training, then applies learned scale and shift. It maintains running statistics for inference. This can improve conditioning and permit faster learning, while mini-batch noise may have a regularizing effect. Its primary engineering role is optimization stability, not a guaranteed substitute for dropout.",
          "Training and evaluation modes matter. If inference uses batch statistics from one request, predictions depend on unrelated examples and tiny batches become unstable. If running statistics are stale after distribution shift or fine-tuning, evaluation can degrade. Distributed training may need synchronized batch statistics when per-device batches are small.",
          "Layer normalization instead normalizes within an example across features and does not depend on other examples in the batch, making it natural for transformers and variable sequence inference. The normalization choice follows architecture and serving conditions."
        ],
        example: "An image service passes one image at a time but accidentally keeps batch normalization in training mode. The prediction depends on the single image’s own activation statistics and dropout may remain active. Offline batch validation looked stable; online outputs fluctuate. Calling evaluation mode and serving the saved running statistics restores training-serving consistency.",
        failure: "Freezing a backbone but continuing to update its batch-normalization running statistics means the ‘frozen’ representation still changes. Decide separately whether parameters and normalization state are trainable.",
        check: { question: "Why does layer normalization avoid dependence on other requests?", answer: "It computes normalization statistics within each example’s feature dimensions rather than across the mini-batch." }
      },
      {
        id: "combined-design",
        title: "Regularization must respect data and deployment",
        body: [
          "Begin with a valid split and baseline. Add one constraint with a hypothesis: augmentations should improve viewpoint robustness; weight decay should reduce coefficient explosion; dropout should reduce co-adaptation; early stopping should avoid late memorization. Track training and validation curves, subgroup performance, and calibration because a method can improve average accuracy while harming probability quality or rare slices.",
          "Hyperparameters interact. Strong weight decay plus high dropout plus a small network can compound into underfit. Batch normalization may reduce the need for some learning-rate caution but introduces state. Evaluate combinations with controlled search, record seeds, and preserve the exact checkpoint and preprocessing.",
          "For transfer learning, regularize the small new head and decide whether to unfreeze the backbone gradually. With little target data, full unfreezing can erase useful pretrained structure; with a large domain gap, freezing may leave representation bias."
        ],
        code: code("python", "class Classifier(nn.Module):\n    def __init__(self, d_in, d_hidden):\n        super().__init__()\n        self.net = nn.Sequential(\n            nn.Linear(d_in, d_hidden),\n            nn.BatchNorm1d(d_hidden),\n            nn.ReLU(),\n            nn.Dropout(p=0.25),\n            nn.Linear(d_hidden, 1)\n        )\n    def forward(self, x):\n        return self.net(x).squeeze(-1)\n\nmodel = Classifier(128, 64)\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)", [
          "Batch normalization precedes activation and carries running state.",
          "Dropout is active only in training mode.",
          "AdamW applies explicit decoupled weight decay."
        ], "It makes each regularization mechanism explicit and ensures mode-aware behavior can be tested."),
        check: { question: "When can augmentation create label noise?", answer: "When the assumed transformation is not truly label-preserving—for example, rotating a 6 into a 9 or mirroring directional medical anatomy." }
      }
    ],
    glossary: [
      ["Dropout", "Randomly masking activations during training to reduce co-adaptation."],
      ["Weight decay", "Optimizer pressure shrinking parameter magnitude."],
      ["Early stopping", "Choosing a pre-final checkpoint from validation behavior."],
      ["Batch normalization", "Batch-statistic normalization with learned affine parameters and running inference state."],
      ["Layer normalization", "Within-example normalization across feature dimensions."],
      ["Data augmentation", "Label-preserving input transformations encoding invariance."],
      ["Co-adaptation", "Units relying on specific other units rather than robust distributed features."],
      ["Transfer learning", "Adapting representations learned on one task or domain to another."],
      ["Fine-tuning", "Continuing parameter training on target-task data."]
    ],
    exercise: {
      duration: 35,
      title: "Regularize an overfit image classifier",
      brief: "Training accuracy is 99.8%, validation 82%, and failures cluster on camera angle and one factory.",
      parts: [
        "Audit the split for factory and near-duplicate leakage before tuning.",
        "Define safe geometric/photometric augmentations with label-preservation tests.",
        "Compare weight decay, dropout, and early stopping one at a time, then one combined candidate.",
        "Inspect train/validation curves, calibration, and the held-out factory slice."
      ],
      solution: "Group related frames and hold out factory/time appropriately. Validate augmentations with domain experts; avoid transformations that change defect meaning. Weight decay should shrink unstable weights, dropout should reduce reliance on feature coalitions, and early stopping should preserve the pre-memorization checkpoint. If all are strong, underfit may result. Select using the held-out design and retain factory-slice recall as a guardrail, not only aggregate accuracy."
    },
    sources: { core: ["pytorchNN","pytorchOptim","pytorchCNN"], deep: ["googleOverfit"] },
    quiz: [
      { concept:"Dropout", prompt:"What should happen to dropout during deterministic production inference?", answer:2, options:[
        ["Its rate should double.","Inference normally uses the full scaled network."],
        ["It should mask the same fixed units forever.","That would permanently remove capacity."],
        ["It should be disabled by evaluation mode.","Correct. Training-time stochastic masks stop."],
        ["It should refit labels.","Dropout does not fit labels directly."]
      ]},
      { concept:"Weight decay", prompt:"A network’s weights grow large while validation deteriorates. Which mechanism directly discourages magnitude?", answer:0, options:[
        ["Weight decay","Correct. It shrinks parameters during updates."],
        ["Larger validation set used for training","That contaminates evaluation."],
        ["More output classes","That changes the task."],
        ["Higher dropout only at inference","Mode-skewed inference is not the remedy."]
      ]},
      { concept:"Batch normalization", prompt:"Why can batch normalization fail with tiny inference batches if left in training mode?", answer:1, options:[
        ["It deletes learned weights.","Weights remain."],
        ["It uses unstable current-batch statistics instead of saved running statistics.","Correct. Predictions can depend on batch composition."],
        ["It converts logits to tokens.","Normalization is unrelated to tokenization."],
        ["It creates exact duplicates.","No records are duplicated."]
      ]},
      { concept:"Layer normalization", prompt:"Why is layer normalization common in transformers?", answer:3, options:[
        ["It requires a fixed global batch of users.","Layer norm is within an example."],
        ["It replaces attention.","It stabilizes blocks; attention remains."],
        ["It guarantees zero hallucinations.","Normalization cannot establish factuality."],
        ["It is independent of other examples in the batch and fits sequence blocks.","Correct."],
      ]},
      { concept:"Augmentation", prompt:"A digit classifier uses arbitrary 180° rotations, turning some 6 images into 9-like images without relabeling. What is introduced?", answer:0, options:[
        ["Systematic label noise from an invalid invariance.","Correct. The transform can change the class."],
        ["Perfect rotational robustness.","The labels contradict the transformed content."],
        ["Only faster training.","Augmentation usually adds compute and here harms semantics."],
        ["Calibrated probabilities.","No calibration process is implied."]
      ]},
      { concept:"Early stopping", prompt:"Why is early stopping a regularizer?", answer:2, options:[
        ["It adds more parameters.","It limits effective fit."],
        ["It uses the test set as training data.","It should use development validation, not test."],
        ["It restricts how long the model can adapt to training-specific detail.","Correct."],
        ["It always selects epoch one.","The selected epoch follows validation and patience."]
      ]},
      { concept:"Transfer learning", prompt:"A small target dataset differs moderately from pretraining data. What is a cautious first approach?", answer:1, options:[
        ["Randomize the backbone and train everything with no validation.","That discards pretrained structure and raises variance."],
        ["Train a new head, then consider gradual unfreezing under validation.","Correct. It controls adaptation capacity."],
        ["Freeze the output head and delete labels.","The new task requires a trained prediction head."],
        ["Update batch-normalization state without tracking it.","Hidden state changes break reproducibility."]
      ]}
    ]
  });

  register({
    id: 16,
    centralQuestion: "How can a small local filter become evidence for an object that spans an entire image?",
    objective: "Reason through convolution, filters, feature maps, stride, padding, pooling, receptive fields, and CNN inductive bias; diagnose resolution and invariance failures.",
    sections: [
      {
        id: "convolution",
        title: "Weight sharing turns locality into a reusable detector",
        body: [
          "A convolutional filter is a small learned kernel slid across spatial positions. At each position it computes a weighted local response, producing a feature map. The same weights are reused everywhere, so an edge detector learned in one corner can fire elsewhere. This translation-equivariant structure uses far fewer parameters than connecting every pixel to every hidden unit.",
          "Multiple filters learn different local patterns and produce multiple channels. Early maps often respond to edges, color contrasts, or textures; later layers combine them into parts and objects. The hierarchy expands the receptive field: although each kernel is local, stacked layers allow a unit to depend on a much larger input region.",
          "The inductive bias is valuable when local spatial patterns repeat. It is not universally correct. Absolute position may matter in medical scans, and long-range global structure may require deeper paths, dilation, larger kernels, or attention."
        ],
        table: table("Convolution geometry", ["Control", "What changes", "Benefit", "Cost"], [
          ["Kernel size", "Local receptive field", "Wider local context", "More parameters/compute"],
          ["Stride", "Step between kernel positions", "Downsampling", "Can skip fine detail"],
          ["Padding", "Boundary treatment/output size", "Preserves edge coverage", "Artificial boundary values"],
          ["Channels", "Number of learned maps", "Representation diversity", "Memory and compute"],
          ["Dilation", "Spacing within kernel", "Larger field without large kernel", "Gridding artifacts"]
        ]),
        check: { question: "Why does weight sharing reduce parameters?", answer: "One kernel’s weights are reused across all spatial locations instead of learning a separate detector at every pixel position." }
      },
      {
        id: "stride-padding-pooling",
        title: "Downsampling trades detail for context and efficiency",
        body: [
          "Stride greater than one reduces feature-map dimensions by moving the filter farther each step. Padding can preserve output size and allow edge pixels to influence as many positions as interior pixels. ‘Same’ padding is shape-oriented, not evidence that boundary treatment is semantically neutral.",
          "Pooling summarizes local neighborhoods. Max pooling retains the strongest activation; average pooling retains mean evidence. Both reduce resolution and add local tolerance to small translations. Strided convolution can learn its downsampling rule but adds parameters. Aggressive early downsampling can erase small defects before later layers ever see them.",
          "Calculate shapes before coding. For one dimension, output size is floor((W + 2P − K)/S) + 1 for kernel K, padding P, and stride S (without dilation). Shape errors compound through a network and influence memory."
        ],
        example: "A quality model searches for 3-pixel hairline cracks. A stride-4 first layer followed by max pooling can skip or collapse them. Validation on resized, centered defects looks good, but production cracks near edges disappear. Preserve early resolution, validate edge/pixel-size slices, and downsample only after local evidence is represented.",
        failure: "Calling pooling ‘feature selection’ is imprecise. Pooling aggregates spatial neighborhoods; it can retain salient responses but also discards exact location and weaker co-occurring evidence.",
        check: { question: "What downstream effect does increasing stride have?", answer: "It lowers spatial resolution, compute, and memory while increasing the risk that small or boundary-localized patterns are skipped." }
      },
      {
        id: "hierarchy",
        title: "Hierarchical representations need deployment-aligned augmentation",
        body: [
          "As feature maps pass through convolution, nonlinearity, and downsampling, later channels encode combinations over larger receptive fields. Classification heads then aggregate spatial evidence. Global average pooling reduces each channel to one value and encourages detection independent of exact location, but this may be inappropriate when location determines the label.",
          "Augmentation should match plausible deployment variation: illumination changes, limited rotations, crop shifts, or sensor noise. It should not manufacture impossible anatomy or change the defect label. Transfer learning reuses pretrained filters, but input normalization, color space, and resolution must match the backbone’s contract.",
          "Interpretation tools such as saliency maps can suggest which pixels influenced output, but they are not causal proof. Pair them with occlusion tests, counterexamples, and slice performance."
        ],
        code: code("python", "class SmallDefectCNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1),\n            nn.ReLU(),\n            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),\n            nn.ReLU(),\n            nn.AdaptiveAvgPool2d((1, 1))\n        )\n        self.head = nn.Linear(64, 2)\n    def forward(self, x):\n        z = self.features(x).flatten(1)\n        return self.head(z)", [
          "The first layer keeps full resolution so tiny evidence is not immediately skipped.",
          "The second layer downsamples after initial local features exist.",
          "Adaptive pooling makes the head independent of the precise input height/width while discarding location."
        ], "It avoids an overly aggressive first stride and makes the location-invariance trade-off explicit."),
        check: { question: "When could global average pooling harm a task?", answer: "When the same pattern has different meaning by location, because the pooling discards where channel evidence occurred." }
      }
    ],
    glossary: [
      ["Convolution", "Sliding weighted local operation with shared kernel parameters."],
      ["Filter / kernel", "Small learned weight grid applied across an input."],
      ["Feature map", "Spatial responses produced by one filter/channel."],
      ["Stride", "Distance the kernel moves between output positions."],
      ["Padding", "Values added around boundaries to control coverage and shape."],
      ["Pooling", "Local aggregation that reduces spatial resolution."],
      ["Receptive field", "Input region capable of influencing one activation."],
      ["Translation equivariance", "Input shifts produce corresponding feature-map shifts."],
      ["Inductive bias", "Architectural assumption that favors some functions before data is seen."],
      ["Global average pooling", "Averaging each feature map across all spatial positions."]
    ],
    exercise: {
      duration: 35,
      title: "Protect tiny defects through a CNN",
      brief: "Design a classifier for 5–12 pixel surface defects in 512×512 images.",
      parts: [
        "Compute feature-map sizes for two candidate stride/padding schedules.",
        "Estimate whether the defect survives each downsampling path.",
        "Choose augmentations and reject one invalid transformation with justification.",
        "Implement a small model, then define edge-location and defect-size evaluation slices."
      ],
      solution: "Keep stride one in the first block, then downsample gradually after several filters can represent the defect. Verify output dimensions and receptive field on paper. Use plausible lighting/noise and limited translations; reject flips if surface orientation changes defect meaning. Report recall by pixel size and edge distance, and inspect occlusion responses. A model that wins aggregate accuracy while missing the smallest safety-critical defects should not pass."
    },
    sources: { core: ["pytorchCNN","pytorchNN"], deep: ["pytorchOptim"] },
    quiz: [
      { concept:"Weight sharing", prompt:"Why can a convolution detect the same edge in different image locations?", answer:0, options:[
        ["The same kernel weights are applied across positions.","Correct. Shared weights create reusable local detection."],
        ["Every pixel has a separate classifier.","That describes a dense, non-shared design."],
        ["Pooling restores deleted pixels.","Pooling aggregates and cannot restore detail."],
        ["The label is copied into the feature map.","That would be leakage, not convolution."]
      ]},
      { concept:"Stride", prompt:"A first-layer stride rises from 1 to 4. What is the primary risk for tiny defects?", answer:2, options:[
        ["The model gains four times more pixels.","Spatial outputs shrink."],
        ["Kernel weights stop sharing.","Sharing remains."],
        ["Fine evidence may be skipped before representation.","Correct. Aggressive sampling can alias or erase small patterns."],
        ["Output channels become labels.","Channels remain features."]
      ]},
      { concept:"Padding", prompt:"What does ‘same’ padding primarily target for stride one?", answer:1, options:[
        ["Perfect semantic treatment of boundaries.","Padding values are still artificial."],
        ["Preserving spatial output dimensions.","Correct."],
        ["Removing all edge information.","It helps retain edge coverage."],
        ["Calibrating class probabilities.","Padding does not calibrate outputs."]
      ]},
      { concept:"Pooling", prompt:"Max pooling over a 2×2 region keeps what?", answer:3, options:[
        ["The exact arrangement of all four values.","Only one summary is retained."],
        ["The average response.","That is average pooling."],
        ["The smallest response.","That would be min pooling."],
        ["The strongest activation, losing exact local arrangement.","Correct."],
      ]},
      { concept:"Receptive field", prompt:"How can a 3×3 kernel contribute to recognizing a large object?", answer:1, options:[
        ["It directly sees the whole image in one layer.","A local kernel does not."],
        ["Stacked layers combine local features over progressively larger receptive fields.","Correct."],
        ["The kernel grows automatically at inference.","Its learned dimensions remain fixed."],
        ["Labels are placed into later pixels.","That is not CNN operation."]
      ]},
      { concept:"Inductive bias", prompt:"Which assumption is built into a conventional CNN?", answer:0, options:[
        ["Local patterns recur across spatial positions.","Correct. Locality and weight sharing encode this bias."],
        ["Every pixel is independent of neighbors.","Convolution explicitly combines neighborhoods."],
        ["Sequence order never matters.","CNNs can be applied to sequences, but this is not the core image bias."],
        ["All classes have equal prevalence.","Architecture does not impose class balance."]
      ]},
      { concept:"Global pooling", prompt:"A pathology label depends on whether a lesion is in the left or right lung. What risk does global average pooling create?", answer:2, options:[
        ["It adds too many spatial coordinates.","It removes them."],
        ["It makes kernels nonlocal by definition.","Earlier kernels remain local."],
        ["It discards location that may be label-relevant.","Correct."],
        ["It guarantees overfitting.","It can regularize, but suitability depends on the task."]
      ]}
    ]
  });

  register({
    id: 17,
    centralQuestion: "A sequence contains a crucial event 200 steps ago. What must the model preserve, update, or forget?",
    objective: "Explain RNN hidden states, temporal parameter sharing, vanishing gradients, and the gating mechanisms of LSTM and GRU; choose sequence designs from dependency and serving requirements.",
    sections: [
      {
        id: "rnn",
        title: "A recurrent state compresses the past",
        body: [
          "A recurrent neural network processes a sequence one step at a time. At step t it combines current input xₜ with previous hidden state hₜ₋₁ to produce hₜ. Shared transition weights let it handle variable lengths and apply the same update rule through time. The hidden state is a learned summary, not a literal storage of every prior token.",
          "Training unfolds the recurrence into a deep computation graph and applies backpropagation through time. Long dependencies require gradients to traverse many repeated transitions; products of derivatives can vanish or explode. Truncating backpropagation reduces memory and compute but limits how far credit assignment reaches.",
          "Sequence direction must match the task. Bidirectional RNNs use future and past context and suit offline tagging, but they leak future observations in causal forecasting or live generation. Padding masks must prevent artificial pad tokens from affecting state or loss."
        ],
        table: table("Sequence model choices", ["Model", "Memory mechanism", "Strength", "Constraint"], [
          ["Vanilla RNN", "Single recurrent hidden state", "Simple and lightweight", "Long-gradient instability"],
          ["LSTM", "Cell state with input/forget/output gates", "Longer controlled memory", "More parameters and compute"],
          ["GRU", "Update/reset gates in one state", "Simpler gated recurrence", "Less separate control than LSTM"],
          ["Bidirectional", "Two directional encoders", "Full-context representation", "Invalid for causal live predictions"]
        ]),
        check: { question: "Why is a bidirectional encoder inappropriate for real-time forecasting at time t?", answer: "Its backward direction uses observations after t, information unavailable to the live decision." }
      },
      {
        id: "gates",
        title: "Gates learn when information should pass",
        body: [
          "An LSTM maintains a cell state with an additive update path. A forget gate scales old cell content, an input gate controls new candidate information, and an output gate controls what becomes the visible hidden state. When the forget gate stays near one, the cell can carry information across many steps with a more stable gradient route.",
          "A GRU combines ideas into update and reset gates. The update gate interpolates between previous state and a new candidate; the reset gate controls how much past state contributes to that candidate. Fewer gates and no separate cell state often make GRUs cheaper, but neither architecture dominates universally.",
          "Gating does not guarantee memory. If training data rarely rewards a long dependency, gates may learn to ignore it. Evaluate performance by dependency distance, sequence length, and missing-step patterns."
        ],
        example: "For predictive maintenance, a pressure spike 12 hours ago matters only if no reset event occurred afterward. An LSTM can learn to write the spike, retain it, and forget it when reset appears. A last-value model misses history; a bag of events loses order; a bidirectional model would illegally consult future reset events during live scoring.",
        failure: "Padding sequences without masks teaches the network that a run of zeros is a real ending pattern. If zero is also a valid sensor value, the confusion is worse. Carry lengths or masks through recurrence, attention, and loss.",
        check: { question: "What role does the LSTM forget gate play?", answer: "It multiplicatively controls how much previous cell state persists into the next step." }
      },
      {
        id: "design",
        title: "Model the sequence that the decision can actually observe",
        body: [
          "Choose the time step, lookback horizon, and output timing from the operational question. Many-to-one classification uses a sequence to predict one outcome; many-to-many tagging predicts per step; autoregressive generation predicts the next item repeatedly. Irregular time gaps need explicit delta-time features or specialized dynamics because step count is not elapsed time.",
          "Stateful online serving can carry hidden state per entity, reducing recomputation but introducing identity, ordering, eviction, and recovery complexity. Stateless serving sends the full lookback each request, which is simpler and reproducible but more expensive. Out-of-order events can corrupt a stateful summary.",
          "Transformers offer parallel attention and often handle long-range relationships better, while recurrence may remain attractive for streaming, small models, and bounded latency. Compare memory, throughput, dependency length, and data size—not fashion."
        ],
        code: code("python", "class SequenceClassifier(nn.Module):\n    def __init__(self, d_in, d_hidden, classes):\n        super().__init__()\n        self.gru = nn.GRU(d_in, d_hidden, batch_first=True)\n        self.head = nn.Linear(d_hidden, classes)\n    def forward(self, padded, lengths):\n        packed = nn.utils.rnn.pack_padded_sequence(\n            padded, lengths.cpu(), batch_first=True, enforce_sorted=False)\n        _, hidden = self.gru(packed)\n        return self.head(hidden[-1])", [
          "Packed sequences stop recurrence at each real length rather than processing padding.",
          "The final valid hidden state summarizes each sequence.",
          "Lengths move to CPU because the packing utility expects them there."
        ], "It prevents padding values from becoming learned events or shifting the final representation."),
        check: { question: "What new failure surface appears with per-customer stateful serving?", answer: "State must be routed to the correct identity in order, persisted or recoverable, expired safely, and protected from cross-customer mixing." }
      }
    ],
    glossary: [
      ["RNN", "Network that updates a shared hidden state across sequence steps."],
      ["Hidden state", "Learned compressed representation passed between steps."],
      ["Backpropagation through time", "Gradient computation through an unrolled recurrence."],
      ["LSTM", "Gated recurrent model with a separate cell state."],
      ["Cell state", "LSTM memory path updated additively through gates."],
      ["Forget gate", "Control on retention of previous LSTM cell content."],
      ["GRU", "Gated recurrent unit with update and reset gates."],
      ["Bidirectional", "Processing both forward and reverse sequence directions."],
      ["Sequence mask", "Indicator separating real steps from padding."],
      ["Stateful serving", "Persisting recurrent state between requests for an entity."]
    ],
    exercise: {
      duration: 35,
      title: "Choose a sequence architecture for equipment alerts",
      brief: "Sensors arrive irregularly; a reset event invalidates earlier spikes; predictions run every minute with a 100 ms budget.",
      parts: [
        "Define step representation, delta-time feature, lookback, and causal label window.",
        "Compare GRU, LSTM, and a small causal transformer for memory and latency.",
        "Implement masked variable-length batching for one candidate.",
        "Design tests for long dependency, reset behavior, out-of-order data, and state recovery."
      ],
      solution: "Represent each event with type, value, and elapsed time; never use future events. GRU may meet latency with fewer parameters; LSTM offers an explicit cell path for retain/forget behavior; a causal transformer provides direct long-range access but may cost more. Start stateless for reproducibility unless state savings are essential. Test that inserting a reset removes earlier spike influence, pads do not alter output, late events follow a declared policy, and restarted services reconstruct identical state."
    },
    sources: { core: ["pytorchNN","pytorchOptim"], deep: ["attentionPaper"] },
    quiz: [
      { concept:"Hidden state", prompt:"What is an RNN hidden state best understood as?", answer:2, options:[
        ["A copy of every prior input.","It is fixed-dimensional and learned, not a literal archive."],
        ["The final label stored early.","That would be leakage."],
        ["A learned summary updated from the previous state and current input.","Correct."],
        ["A random test partition.","It is model state, not data splitting."]
      ]},
      { concept:"BPTT", prompt:"Why do vanilla RNNs struggle with events hundreds of steps apart?", answer:0, options:[
        ["Gradients multiply through repeated transitions and may vanish or explode.","Correct."],
        ["Their labels must be images.","RNNs support many sequence targets."],
        ["They cannot share weights.","Weight sharing is central to recurrence."],
        ["They always see future tokens.","Unidirectional RNNs are causal."]
      ]},
      { concept:"LSTM gates", prompt:"Which LSTM gate directly controls retained prior cell state?", answer:1, options:[
        ["Output gate","It controls exposed hidden output."],
        ["Forget gate","Correct."],
        ["Softmax gate","Softmax is not an LSTM memory gate."],
        ["Pooling gate","Pooling is a separate operation."]
      ]},
      { concept:"GRU", prompt:"How does a GRU differ structurally from an LSTM?", answer:3, options:[
        ["It has no learned parameters.","A GRU is fully learned."],
        ["It uses only future sequence context.","Direction is configurable."],
        ["It requires images.","GRUs model general sequences."],
        ["It combines memory controls into update/reset gates without a separate cell state.","Correct."],
      ]},
      { concept:"Causality", prompt:"A real-time failure predictor uses a bidirectional RNN over the full day, including hours after each prediction. What is wrong?", answer:1, options:[
        ["Bidirectional models are too small.","Capacity is not the defect."],
        ["The backward direction exposes future events unavailable at decision time.","Correct. This is temporal leakage."],
        ["The model cannot represent order.","Both directions represent order."],
        ["The labels become continuous.","Architecture does not change label type."]
      ]},
      { concept:"Padding", prompt:"Padded zeros are processed as real sensor readings. What failure can follow?", answer:0, options:[
        ["The network learns sequence-length artifacts or false zero events.","Correct. Use masks or packed sequences."],
        ["The GPU becomes a CPU.","Hardware type is unchanged."],
        ["Every gradient becomes exactly one.","No such implication exists."],
        ["The output is automatically calibrated.","Padding does not calibrate probabilities."]
      ]},
      { concept:"Stateful serving", prompt:"A stateful sequence service routes one customer’s next event to a replica holding another customer’s state. What is the primary risk?", answer:2, options:[
        ["Only higher training loss.","This occurs during serving."],
        ["Loss of convolution padding.","No CNN geometry is involved."],
        ["Cross-entity state contamination and incorrect predictions.","Correct. Routing and identity isolation are essential."],
        ["Improved cold-start behavior.","Mixed state is not valid history."]
      ]}
    ]
  });

  register({
    id: 18,
    centralQuestion: "When one token needs evidence from another, how do queries, keys, and values decide the information path?",
    objective: "Compute scaled dot-product attention, explain query/key/value roles, softmax weights, masking, multi-head attention, positional information, and the memory/compute trade-offs.",
    sections: [
      {
        id: "qkv",
        title: "Queries ask; keys advertise; values carry",
        body: [
          "Self-attention projects each token representation into a query, key, and value. For a destination token, its query is compared with every allowed source key. A high query–key dot product means the learned features are compatible. Dividing by √dₖ controls variance as dimension grows; softmax turns scaled scores into nonnegative weights that sum to one. The output is the weighted sum of source values.",
          "The roles are relational, not fixed dictionary meanings. A token can ask different questions in different heads because projection matrices are learned. Keys determine addressability; values provide the information returned. Changing values while holding scores fixed changes content but not attention weights. Changing queries or keys changes routing.",
          "Attention weights are conditional on all allowed sources. Adding a highly scored token redistributes softmax mass, so an apparently important token’s weight can fall even when its own score is unchanged. Weights are useful diagnostics but not guaranteed causal explanations."
        ],
        diagram: diagram("attention", "Scaled dot-product attention", ["Token states", "Q · Kᵀ", "Scale + mask", "Softmax weights", "Weighted V"], [[0,1],[1,2],[2,3],[3,4],[0,4]], "Queries and keys choose routes; values carry the routed content."),
        check: { question: "If value vectors change but queries and keys do not, what stays fixed?", answer: "The attention weights stay fixed, while the weighted output content changes." }
      },
      {
        id: "mask-position",
        title: "Masks determine who is allowed to communicate",
        body: [
          "A causal mask blocks a position from attending to future positions, making next-token generation valid. A padding mask blocks artificial pad tokens. These solve different problems and may be combined. Masked scores are set to an effectively negative infinity before softmax so their weights become zero.",
          "Self-attention without positional information is insensitive to token order up to permutation: it sees a set of token representations. Positional encodings or learned position embeddings inject order. Relative position methods represent distances between tokens and can transfer differently to longer contexts.",
          "Mask errors are security and correctness errors. An off-by-one causal mask can let the model see the target token during training, producing implausibly low loss. A missing pad mask lets sequence length influence representation."
        ],
        table: table("Attention controls", ["Control", "Permits", "Blocks", "Failure if absent"], [
          ["Causal mask", "Current and previous positions", "Future tokens", "Future-token leakage"],
          ["Padding mask", "Real tokens", "Artificial padding", "Length artifacts"],
          ["Positional signal", "Order-aware relations", "—", "Bag-of-tokens ambiguity"],
          ["Scaling by √dₖ", "Stable softmax range", "—", "Saturation and weak gradients"]
        ]),
        failure: "Applying a causal mask after softmax and merely zeroing future weights leaves the remaining weights summing to less than one unless renormalized. Mask scores before softmax.",
        check: { question: "Why must the causal mask be applied before softmax?", answer: "Then blocked positions receive zero probability and allowed positions are normalized together into a valid distribution." }
      },
      {
        id: "multihead",
        title: "Multiple heads create parallel relation subspaces",
        body: [
          "Multi-head attention divides the model dimension across several learned Q/K/V projections. One head may specialize in short-range syntax, another in entity reference, another in delimiter structure. Head outputs are concatenated and projected back. This provides several relational views without each head using the full dimension.",
          "For sequence length n, dense self-attention constructs n×n score relationships, so memory and compute grow quadratically in n. Long context can therefore reduce batch size, throughput, and latency. Sparse, local, sliding-window, or retrieval-based designs trade completeness for efficiency.",
          "A larger context window is not equivalent to effective use of context. Relevant evidence can be diluted, truncated, or poorly attended. Evaluate accuracy by evidence position, length, distractor count, and retrieval quality."
        ],
        code: code("python", "import math\nimport torch\n\ndef scaled_attention(q, k, v, allowed):\n    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))\n    scores = scores.masked_fill(~allowed, float(\"-inf\"))\n    weights = torch.softmax(scores, dim=-1)\n    output = weights @ v\n    return output, weights", [
          "The transpose aligns every query with every source key.",
          "Scaling prevents dot products from growing with key dimension.",
          "The boolean mask is applied before softmax.",
          "Only values are averaged into the output."
        ], "It prevents future or padding positions from receiving attention mass and keeps the softmax numerically trainable."),
        check: { question: "Why does doubling sequence length cause more than double dense-attention work?", answer: "Every query compares with every key, so the score matrix grows with n²." }
      }
    ],
    glossary: [
      ["Query", "Projected destination representation used to request relevant sources."],
      ["Key", "Projected source representation used for compatibility scoring."],
      ["Value", "Projected source content combined by attention weights."],
      ["Attention score", "Query–key compatibility before or after scaling/masking."],
      ["Softmax attention", "Normalized nonnegative weights over allowed source positions."],
      ["Self-attention", "Attention where queries, keys, and values come from the same sequence."],
      ["Multi-head attention", "Parallel learned attention projections concatenated into one output."],
      ["Causal mask", "Constraint preventing access to future positions."],
      ["Positional encoding", "Signal allowing the model to represent token order."],
      ["Attention head", "One learned query/key/value relation subspace."]
    ],
    exercise: {
      duration: 85,
      title: "Compute and debug a masked attention layer",
      brief: "Use a four-token sequence with 2D query, key, and value matrices.",
      parts: [
        "Calculate scores, √d scaling, causal masking, softmax weights, and one output row by hand.",
        "Implement the calculation and compare with your arithmetic.",
        "Introduce a post-softmax mask bug and explain the changed row sums and training signal.",
        "Estimate score-matrix memory at lengths 1k, 8k, and 32k for eight heads and discuss design alternatives.",
        "Complete a short attention error analysis using evidence at early, middle, and late positions."
      ],
      solution: "For token t, only columns ≤t remain finite before softmax. Divide dot products by √2, exponentiate after a stable max subtraction, normalize, then multiply weights by value rows. A post-softmax zero mask loses normalization and changes output scale. Dense scores scale by heads×n²×bytes, so 32k context is roughly 1,024 times the score entries of 1k. Consider local/sparse attention or retrieval when most distant pairs are irrelevant, and test evidence position rather than assuming advertised context equals usable context."
    },
    sources: { core: ["attentionPaper","hfTransformers"], deep: ["pytorchNN"] },
    quiz: [
      { concept:"QKV roles", prompt:"Which vectors determine attention routing before the weighted content is combined?", answer:1, options:[
        ["Values only","Values carry content after weights are selected."],
        ["Queries and keys","Correct. Their compatibility produces scores."],
        ["Labels and losses","They train projections but do not form inference routing directly."],
        ["Epochs and batches","These are training organization concepts."]
      ]},
      { concept:"Scaling", prompt:"Why divide query–key dot products by √dₖ?", answer:2, options:[
        ["To make sequence length exactly one.","Scaling does not change length."],
        ["To remove positional information.","Position remains in representations."],
        ["To keep score variance and softmax saturation controlled as dimension grows.","Correct."],
        ["To guarantee equal weights.","Content still determines scores."]
      ]},
      { concept:"Softmax", prompt:"A new source token receives a very high score. What happens to existing attention weights?", answer:0, options:[
        ["Their normalized mass can decrease because softmax redistributes a fixed total of one.","Correct."],
        ["They remain numerically identical by definition.","Softmax denominator changes."],
        ["They all become negative.","Softmax weights are nonnegative."],
        ["Values become keys.","Projection roles do not swap."]
      ]},
      { concept:"Causal mask", prompt:"A next-token model attends to the token it is meant to predict during training. What symptom is likely?", answer:3, options:[
        ["Higher valid loss due to less information.","It has more illegal information."],
        ["No gradient can flow.","Gradients can flow through the shortcut."],
        ["Only padding is affected.","The future target path affects all sequences."],
        ["Suspiciously low training loss and failure at autoregressive inference.","Correct. The shortcut disappears at generation time."],
      ]},
      { concept:"Padding mask", prompt:"Why mask padded positions separately from future positions?", answer:1, options:[
        ["Padding is always a future label.","Padding is artificial sequence fill."],
        ["Real sequences have different lengths; pads must never contribute as content.","Correct."],
        ["Causal masks make all tokens bidirectional.","They restrict direction."],
        ["Padding improves calibration.","No probability guarantee follows."]
      ]},
      { concept:"Position", prompt:"What ambiguity remains in self-attention with no positional signal?", answer:0, options:[
        ["Permutations of the same token set can look equivalent.","Correct. Order is not represented."],
        ["Values cannot be multiplied.","Matrix operations still work."],
        ["Only the first token has a query.","All positions can have queries."],
        ["The vocabulary becomes infinite.","Vocabulary size is separate."]
      ]},
      { concept:"Multi-head", prompt:"What is the main representational benefit of multiple attention heads?", answer:2, options:[
        ["Every head sees a different label set.","Heads share the task."],
        ["Quadratic memory disappears.","Dense heads still use n² relationships."],
        ["Parallel projections can represent different relation patterns.","Correct."],
        ["Softmax is no longer needed.","Each head commonly uses softmax attention."]
      ]},
      { concept:"Complexity", prompt:"Sequence length rises from 2,000 to 8,000 with dense attention. Approximately how does score-matrix size change?", answer:1, options:[
        ["4×","That would be linear growth."],
        ["16×","Correct. Length is 4× and n² is 16×."],
        ["64×","That would be cubic."],
        ["It stays fixed.","Dense attention depends on length."]
      ]},
      { concept:"Attention explanation", prompt:"A token receives the largest attention weight. Can we conclude it causally determined the answer?", answer:3, options:[
        ["Yes, attention is always a causal proof.","Weights are conditional diagnostics, not guaranteed causal attribution."],
        ["Yes, if the token is early.","Position does not establish causality."],
        ["No, because weights never matter.","Weights do affect the value mixture."],
        ["No; test interventions or ablations because value paths and later layers also matter.","Correct."],
      ]},
      { concept:"Value vectors", prompt:"Queries and keys remain fixed, but all value vectors double. What changes directly?", answer:0, options:[
        ["The attention output doubles while weights stay the same.","Correct, before later nonlinearities."],
        ["Every softmax weight doubles.","Weights must still sum to one and Q/K are unchanged."],
        ["The causal mask reverses.","Masking is unchanged."],
        ["Sequence length halves.","Tensor length does not change."]
      ]}
    ]
  });
})();

(function () {
  "use strict";
  const { register, table, code, diagram } = window.AcademyContent;

  register({
    id: 19,
    centralQuestion: "Should the model read the whole input, generate one token at a time, or connect an encoder to a decoder?",
    objective: "Trace transformer blocks and select encoder-only, decoder-only, or encoder–decoder architectures using masking, task direction, latency, and output requirements.",
    sections: [
      {
        id: "block",
        title: "A transformer block alternates communication and transformation",
        body: [
          "Self-attention lets each allowed token gather information from other positions. A position-wise feed-forward network then transforms each token independently using the same weights across positions. Residual connections add a block’s input to its output, preserving a short information and gradient path. Layer normalization stabilizes activation scale within each token representation.",
          "A stack repeats this pattern: communication mixes context; feed-forward layers reshape features. Residual branches mean a block can learn an incremental refinement instead of reconstructing its entire input. Normalization placement—before or after sublayers—changes optimization behavior, especially in deep networks.",
          "Parallelism is architectural, not universal. An encoder can process all input positions simultaneously because it has the full sequence. Autoregressive decoding still generates sequentially: token t depends on tokens before it, although attention within each step is parallel and key/value caching avoids recomputing earlier projections."
        ],
        diagram: diagram("transformer", "Transformer block flow", ["Token + position", "Self-attention", "Residual + norm", "Feed-forward", "Residual + norm"], [[0,1],[1,2],[0,2],[2,3],[3,4],[2,4]], "Attention communicates across positions; feed-forward layers transform each position."),
        check: { question: "What problem do residual connections solve besides convenience?", answer: "They preserve a direct information and gradient route, allowing deep blocks to learn refinements instead of rebuilding representations." }
      },
      {
        id: "families",
        title: "Architecture families encode information direction",
        body: [
          "Encoder-only models use bidirectional self-attention: every input token can attend to left and right context. They fit representation and understanding tasks such as classification, retrieval embeddings, and token labeling when the full input is available. A task head consumes token or pooled representations.",
          "Decoder-only models use causal self-attention and predict the next token. Repeating next-token prediction produces open-ended text and enables instruction-following after adaptation. Prompt and generated tokens occupy one causal sequence. Encoder–decoder models first build bidirectional source representations; the decoder uses causal self-attention plus cross-attention to those encoder states. This separation is natural for translation, summarization, and transformations from an input sequence to a distinct output sequence.",
          "The family is not a capability guarantee. Decoder-only systems can classify through prompting; encoders can support extractive question answering. Choose based on output form, training objective, latency, controllability, and available models."
        ],
        table: table("Transformer family decision", ["Family", "Attention visibility", "Natural tasks", "Serving consequence"], [
          ["Encoder-only", "Bidirectional input", "Classification, embeddings, extraction", "One parallel forward pass"],
          ["Decoder-only", "Causal", "Generation, completion, instruction following", "Sequential token latency + KV cache"],
          ["Encoder–decoder", "Bidirectional source; causal target; cross-attention", "Translation, summarization, structured transformation", "Encode once, decode autoregressively"]
        ]),
        failure: "Using a bidirectional encoder over future telemetry for a live forecast is temporal leakage, even though the architecture is technically correct for offline classification.",
        check: { question: "What information does decoder cross-attention use in an encoder–decoder model?", answer: "Decoder queries attend to keys and values derived from the encoded source sequence, while decoder self-attention remains causal." }
      },
      {
        id: "serving",
        title: "Generation performance depends on state reuse and stopping",
        body: [
          "During autoregressive generation, naïvely recomputing attention for every prior token at every step wastes work. A key/value cache stores projections for previous tokens so each new step computes only the new token’s projections and attends to cached state. Cache memory grows with sequence length, layers, heads, and concurrent requests; long contexts can make memory, not arithmetic, the serving limit.",
          "The model stops on an end token, a maximum token budget, or application rule. A maximum protects latency and cost but can truncate structured output. Beam search, greedy decoding, and sampling create different output and compute profiles. Batching requests with different generation lengths can leave fast requests waiting for slow ones unless continuous batching schedules active sequences.",
          "Architecture selection therefore reaches operations: an encoder classifier may return in one pass, while a decoder must meet time-to-first-token and per-token latency objectives."
        ],
        code: code("python", "from transformers import AutoTokenizer, AutoModelForSequenceClassification\n\nname = \"distilbert-base-uncased-finetuned-sst-2-english\"\ntok = AutoTokenizer.from_pretrained(name)\nmodel = AutoModelForSequenceClassification.from_pretrained(name)\ninputs = tok([\"The service recovered quickly.\"], return_tensors=\"pt\",\n             truncation=True, padding=True)\nwith torch.inference_mode():\n    logits = model(**inputs).logits\nprob = logits.softmax(dim=-1)", [
          "An encoder-only task head returns class logits in one forward pass.",
          "Tokenization truncation and padding are explicit input-policy choices.",
          "Inference mode prevents gradient storage during serving."
        ], "It prevents accidental autoregressive complexity for a fixed-label classification task and makes token-length behavior explicit."),
        check: { question: "Why can KV cache become the concurrency bottleneck?", answer: "Each active sequence retains per-layer keys and values for its context, so memory grows with tokens and simultaneous requests." }
      }
    ],
    glossary: [
      ["Transformer block", "Attention and feed-forward sublayers connected by residuals and normalization."],
      ["Feed-forward block", "Position-wise nonlinear transformation shared across sequence positions."],
      ["Residual connection", "Addition of a sublayer input to its output."],
      ["Layer normalization", "Within-example feature normalization used around transformer sublayers."],
      ["Encoder-only", "Bidirectional transformer representation architecture."],
      ["Decoder-only", "Causally masked autoregressive transformer architecture."],
      ["Encoder–decoder", "Source encoder plus causal decoder with cross-attention."],
      ["Cross-attention", "Attention whose queries and source keys/values come from different sequences."],
      ["KV cache", "Stored past key/value projections reused during generation."],
      ["Causal decoding", "Generating each token using only prior allowed tokens."]
    ],
    exercise: {
      duration: 35,
      title: "Choose architectures for three enterprise tasks",
      brief: "Tasks are ticket routing, policy summarization, and conversational drafting with tools.",
      parts: [
        "Choose encoder-only, encoder–decoder, or decoder-only as a baseline for each and defend information direction.",
        "Estimate whether each task requires generation and where latency is spent.",
        "Define truncation, stopping, and structured-output behavior.",
        "Identify one case where a different family could work but would carry a trade-off."
      ],
      solution: "Ticket routing naturally uses one encoder pass and a class head. Policy summarization fits encoder–decoder source/target separation, though a decoder-only model can perform it through prompting at potentially higher token cost. Conversational drafting with tools naturally uses a decoder-only instruction model. Define maximum lengths from data, reject or chunk oversized inputs, stop on validated schema completion, and measure time to first token plus per-token latency for generation."
    },
    sources: { core: ["hfTransformers","attentionPaper"], deep: ["hfTokenizers"] },
    quiz: [
      { concept:"Transformer block", prompt:"Which sublayer directly mixes information across token positions?", answer:0, options:[
        ["Self-attention","Correct. It forms weighted combinations of source positions."],
        ["Position-wise feed-forward network","It transforms each position separately."],
        ["Output softmax over classes","It maps final logits, not internal token communication."],
        ["Data loader","It forms batches outside the block."]
      ]},
      { concept:"Residuals", prompt:"A deep transformer loses optimization signal. Why can residual paths help?", answer:2, options:[
        ["They remove every nonlinear layer.","Sublayers remain."],
        ["They reveal future tokens.","Masking remains in attention."],
        ["They provide shorter identity-like paths for information and gradients.","Correct."],
        ["They guarantee factual generation.","Architecture does not guarantee factuality."]
      ]},
      { concept:"Encoder-only", prompt:"Which baseline best fits classifying a complete support ticket into 20 queues?", answer:1, options:[
        ["A causal decoder generating an essay is required.","Generation is unnecessary for a fixed label."],
        ["An encoder-only model with a classification head.","Correct. It uses full context and one pass."],
        ["An image CNN with no text representation.","The input is text."],
        ["A bidirectional model that sees future production tickets.","Full context within one ticket is fine; future examples are not."]
      ]},
      { concept:"Decoder-only", prompt:"Why is decoder-only attention causally masked during next-token training?", answer:3, options:[
        ["To force all tokens to attend to padding.","Pads should be masked out."],
        ["To eliminate positional information.","Position remains essential."],
        ["To make generation bidirectional.","Causal masking is unidirectional."],
        ["To prevent the model from reading the target and later tokens.","Correct."],
      ]},
      { concept:"Encoder–decoder", prompt:"In translation, what does cross-attention provide to the decoder?", answer:0, options:[
        ["Access to encoded source-language representations.","Correct."],
        ["Access to future target tokens.","Target self-attention remains causal."],
        ["A replacement for output vocabulary.","The decoder still predicts tokens."],
        ["A guarantee of aligned word counts.","Languages have different structures and lengths."]
      ]},
      { concept:"KV cache", prompt:"A generation service enables KV caching. Which resource tends to increase per active long request?", answer:2, options:[
        ["Training labels","Serving has no training labels."],
        ["Disk lineage only","The cache is active inference state."],
        ["Accelerator memory used for stored past keys and values.","Correct."],
        ["Number of model parameters","Parameters are unchanged."]
      ]},
      { concept:"Serving latency", prompt:"Why is a decoder’s response latency different from an encoder classifier’s?", answer:1, options:[
        ["The encoder has no parameters.","Encoders have learned parameters."],
        ["The decoder emits tokens sequentially after an initial prompt pass.","Correct. Measure first-token and per-token latency."],
        ["A decoder never uses parallel matrix operations.","Each step still uses parallel kernels."],
        ["Classification always requires beam search.","It normally does not."]
      ]}
    ]
  });

  register({
    id: 20,
    centralQuestion: "If a sentence fits in human memory but exceeds the model’s token budget, what exactly is being counted and lost?",
    objective: "Explain subword tokenization, BPE-style vocabulary construction, token IDs, special tokens, context limits, truncation, padding, and their multilingual and cost consequences.",
    sections: [
      {
        id: "subwords",
        title: "Tokenization chooses the atoms the model can see",
        body: [
          "A tokenizer maps text to discrete tokens and then token IDs from a fixed vocabulary. Word-level vocabularies make rare and unseen words difficult; character vocabularies produce long sequences. Subword methods occupy the middle: frequent words may remain whole, while rare words split into reusable pieces.",
          "Byte-pair-encoding-like training begins from small units and repeatedly merges frequent adjacent pairs until a vocabulary budget is reached. The result is data-dependent. Domain terms, names, code, and languages underrepresented in tokenizer training may fragment into many pieces. More tokens mean more context consumption, attention work, cost, and sometimes weaker representation.",
          "Token boundaries are not linguistic truth. Leading spaces, case, punctuation, and Unicode normalization can alter pieces. Never estimate limits from character count alone. Use the deployed model’s exact tokenizer and version."
        ],
        table: table("Token unit trade-offs", ["Unit", "Vocabulary", "Sequence length", "Unknown handling", "Risk"], [
          ["Word", "Large", "Short", "Unknown token", "Rare words and morphology"],
          ["Character", "Small", "Long", "Natural coverage", "Long-range burden"],
          ["Subword", "Medium", "Medium", "Decomposition", "Unequal fragmentation across domains/languages"],
          ["Byte-level", "Bounded coverage", "Can be long", "Covers arbitrary bytes", "Human-unintuitive splits"]
        ]),
        check: { question: "Why might the same meaning cost more tokens in one language than another?", answer: "The learned vocabulary may represent one language with frequent long subwords and another with more fragmented pieces." }
      },
      {
        id: "ids-special",
        title: "Token IDs are model-specific addresses",
        body: [
          "After segmentation, each token becomes an integer ID indexing an embedding row. ID 42 has no universal meaning; using a tokenizer from another model maps text to the wrong embedding addresses even when vocabulary sizes match. Tokenizer files and special-token definitions are part of the model artifact.",
          "Special tokens mark boundaries, padding, roles, unknowns, or end-of-sequence. Chat templates insert system, user, and assistant delimiters expected by instruction-tuned models. Manually concatenating messages can omit these control tokens or duplicate them, degrading behavior and potentially weakening instruction boundaries.",
          "Padding aligns batch lengths. Attention masks prevent pad tokens from participating. Left versus right padding can matter for decoder generation and position indices. Truncation direction determines which evidence disappears; blindly keeping the first tokens may discard the customer’s latest question or policy conclusion."
        ],
        example: "An Arabic-English policy prompt uses 1.8× more tokens than an English-only estimate and truncates the retrieved clause at the end. The model hallucinates an answer from the surviving introduction. Counting with the exact tokenizer, budgeting the response, and ranking/chunking evidence before prompt construction prevents silent evidence loss.",
        failure: "A character limit is not a token contract. Unicode, code, URLs, and multilingual text have variable token-to-character ratios, so production must count tokens after applying the actual chat template.",
        check: { question: "Why must the chat template be included when estimating prompt tokens?", answer: "Role markers and special delimiters consume tokens and define the representation the instruction-tuned model expects." }
      },
      {
        id: "context",
        title: "A context window is a shared budget, not a comprehension guarantee",
        body: [
          "The context limit includes system instructions, conversation history, tool schemas, retrieved passages, user input, and generated output according to provider rules. Reserving no output budget can cause truncation or request rejection. A long advertised window describes capacity, not reliable use of every position.",
          "Truncation should be semantic. Preserve current instructions and the user’s latest request, summarize older conversation with provenance, select the most relevant evidence, and retain document boundaries and citations. Sliding windows work for local sequence tasks but can lose cross-window dependencies.",
          "Token monitoring belongs in LLMOps. Track prompt, retrieval, cached, and output tokens by route and model version; alert on distribution shifts. A tokenizer or template change can raise cost and latency without changing visible text."
        ],
        code: code("python", "from transformers import AutoTokenizer\n\ntok = AutoTokenizer.from_pretrained(MODEL_ID, revision=MODEL_REVISION)\nmessages = [\n    {\"role\": \"system\", \"content\": system_policy},\n    {\"role\": \"user\", \"content\": user_question}\n]\nids = tok.apply_chat_template(messages, tokenize=True, add_generation_prompt=True)\nmax_output = 600\nif len(ids) + max_output > CONTEXT_LIMIT:\n    raise ValueError(\"Prompt exceeds context budget after chat templating\")", [
          "Model and tokenizer revisions are pinned together.",
          "The chat template is applied before counting.",
          "Output capacity is reserved rather than assuming the full window belongs to input."
        ], "It prevents silent evidence truncation and tokenizer/template skew between testing and production."),
        check: { question: "Does a 128k context window mean a model will use evidence at every position equally well?", answer: "No. It states an input capacity; effective retrieval and reasoning across positions must be evaluated." }
      }
    ],
    glossary: [
      ["Token", "Discrete text unit consumed or generated by a model."],
      ["Subword", "Reusable token piece smaller than many words and larger than a character."],
      ["BPE", "Iterative frequent-pair merging approach used to construct subword vocabularies."],
      ["Vocabulary", "Model-specific mapping between tokens and IDs."],
      ["Token ID", "Integer index selecting a token embedding."],
      ["Special token", "Reserved marker for roles, boundaries, padding, or control."],
      ["Chat template", "Model-specific serialization of role-tagged messages."],
      ["Context window", "Maximum model input/output token capacity under its interface."],
      ["Truncation", "Removal of tokens to satisfy a limit."],
      ["Attention mask", "Indicator specifying which token positions participate."]
    ],
    exercise: {
      duration: 35,
      title: "Budget a multilingual RAG prompt",
      brief: "A 16k-token model receives system policy, tool schemas, Arabic-English conversation history, retrieved clauses, and must generate up to 800 tokens.",
      parts: [
        "Count each component after the exact chat template, not by characters.",
        "Compare fragmentation for representative Arabic, English, code, and IDs.",
        "Design a semantic truncation priority and preserve citation mapping.",
        "Define token, latency, and cost monitoring fields."
      ],
      solution: "Reserve the 800 output tokens plus provider overhead first. Keep system and safety instructions, the current user request, and highest-ranked complete evidence chunks. Summarize or drop older low-value turns; never cut citations away from claims. Measure token ratios by language and domain terms with the deployed tokenizer. Log tokenizer/model/template revision, prompt tokens by component, output and cached tokens, truncation reason, retained source IDs, cost, and latency."
    },
    sources: { core: ["hfTokenizers","hfTransformers"], deep: ["attentionPaper"] },
    quiz: [
      { concept:"Subwords", prompt:"Why do subword tokenizers handle rare words better than fixed word vocabularies?", answer:1, options:[
        ["They memorize every possible word.","The vocabulary remains finite."],
        ["They decompose rare words into reusable known pieces.","Correct."],
        ["They remove spelling information.","Pieces retain textual form."],
        ["They use labels during inference.","Tokenization is input processing."]
      ]},
      { concept:"BPE", prompt:"What drives a BPE-style merge during tokenizer training?", answer:0, options:[
        ["Frequent adjacent unit pairs in the training corpus.","Correct."],
        ["Highest model loss at deployment.","Tokenizer vocabulary is typically trained separately."],
        ["Random test labels.","Labels are not required for token merging."],
        ["GPU temperature.","Hardware telemetry does not define vocabulary."]
      ]},
      { concept:"Token IDs", prompt:"Can token ID 314 from model A be passed safely to model B because both have 50k vocabularies?", answer:3, options:[
        ["Yes, identical size proves identical mapping.","Mappings can differ completely."],
        ["Yes, token IDs are Unicode code points.","They are learned vocabulary indices."],
        ["Only if the sentence is English.","Language does not align vocabularies."],
        ["No; tokenizer mapping and special tokens must match the model revision.","Correct."],
      ]},
      { concept:"Chat templates", prompt:"A team joins system and user text with newlines instead of the model’s chat template. What can fail?", answer:2, options:[
        ["The GPU loses all memory.","Formatting alone does not necessarily exhaust memory."],
        ["The vocabulary becomes ordinal.","Vocabulary mapping is unchanged."],
        ["Role boundaries differ from instruction-tuning expectations.","Correct. Control tokens may be missing or malformed."],
        ["Every output becomes deterministic.","Sampling settings still apply."]
      ]},
      { concept:"Context budget", prompt:"A model supports 32k tokens and output may be 2k. How much input is safely available before other overhead?", answer:0, options:[
        ["At most about 30k, with additional template/provider margin considered.","Correct. Input and output share the budget under typical interfaces."],
        ["Exactly 32k plus unlimited output.","That exceeds the context budget."],
        ["Only 2k.","The output reservation is not the input limit."],
        ["Character count determines it exactly.","Token count is model-specific."]
      ]},
      { concept:"Truncation", prompt:"A policy answer depends on the conclusion at the end of a retrieved section. Head-only truncation removes it. What is the best repair?", answer:1, options:[
        ["Increase temperature.","Sampling cannot restore missing evidence."],
        ["Select complete relevant chunks within a reserved token budget.","Correct. Retrieval and semantic boundaries should precede construction."],
        ["Rename token IDs.","IDs are fixed by vocabulary."],
        ["Add more old conversation turns.","That consumes more context."]
      ]},
      { concept:"Multilingual cost", prompt:"Arabic text consumes more tokens than English for the same workflow. What should capacity planning use?", answer:2, options:[
        ["One universal characters-per-token constant.","Ratios vary by language and content."],
        ["Only the English median.","That underestimates multilingual demand."],
        ["Observed token distributions by language using the production tokenizer/template.","Correct."],
        ["Word count from a different model.","Tokenizer mismatch invalidates the estimate."]
      ]}
    ]
  });

  register({
    id: 21,
    centralQuestion: "Two vectors are close. Do they express the same meaning, the same use case, or merely the same surface pattern?",
    objective: "Use embeddings and cosine similarity responsibly; diagnose anisotropy, normalization, task mismatch, hubness, thresholding, and retrieval/cold-start consequences.",
    sections: [
      {
        id: "space",
        title: "An embedding space is learned for a purpose",
        body: [
          "An embedding maps an object—token, sentence, image, user, or product—to a dense vector. Training objectives arrange vectors so certain relationships become geometrically accessible. A language embedding may place paraphrases nearby; a recommendation embedding may place users near items they engage with. Closeness is evidence only under the objective, data, and preprocessing that created the space.",
          "Cosine similarity is the dot product divided by vector norms, measuring angle rather than magnitude. If vectors are L2-normalized, cosine similarity equals their dot product. Euclidean distance mixes direction and magnitude. Some models encode useful confidence or popularity in norm; normalizing would discard it. Follow the embedding model’s documented similarity and normalization contract.",
          "Embedding dimensions are not usually individually interpretable. The vector gains meaning through relative geometry. Version the model, pooling rule, text prefix, tokenizer, and normalization because changing any of them can invalidate stored vectors."
        ],
        table: table("Similarity measures", ["Measure", "Uses magnitude?", "Equivalent condition", "Risk"], [
          ["Cosine similarity", "No, after norm division", "Dot product on unit vectors", "Unstable for near-zero vectors"],
          ["Dot product", "Yes", "Cosine when both normalized", "High-norm items can dominate"],
          ["Euclidean distance", "Yes", "Related to cosine on unit sphere", "Scale-sensitive"],
          ["Learned reranker score", "Model-dependent", "None", "Higher latency and calibration ambiguity"]
        ]),
        check: { question: "When are dot product and cosine similarity numerically equivalent?", answer: "When both vectors have been normalized to unit L2 norm." }
      },
      {
        id: "retrieval",
        title: "Nearest-neighbor retrieval is a candidate generator",
        body: [
          "A vector database stores embeddings and retrieves approximate nearest neighbors efficiently. Approximation trades small recall losses for speed and memory. Top-k controls candidate count: larger k raises the chance of retrieving relevant evidence but adds distractors, prompt tokens, and reranking cost. A similarity threshold can reject weak matches but must be tuned on labeled query-document pairs.",
          "Metadata filtering constrains candidates by permissions, language, date, product, or document status. Filter-before-search can improve relevance but leave too few candidates; filter-after-search may discard most of a small top-k. The index design must support the required filter semantics and authorization should be enforced before content is exposed.",
          "Dense similarity can miss exact identifiers and rare terms. Hybrid search combines lexical and dense signals; a cross-encoder reranker jointly reads query and candidate for more precise ordering. Evaluate retrieval recall, precision, reciprocal rank, and downstream answer quality separately."
        ],
        example: "A support query ‘error E0427’ is semantically similar to many generic failure articles, but the exact code appears in one short bulletin. Dense-only retrieval misses it; lexical search finds it. Hybrid candidates plus a reranker retain exact-match strength and semantic paraphrase coverage.",
        failure: "Using the top cosine score as a calibrated probability of relevance is unjustified. Similarity scales vary by model, corpus, query type, and index; learn thresholds from representative retrieval labels.",
        check: { question: "Why can raising top-k improve retrieval recall but harm answer quality?", answer: "More candidates increase the chance of including evidence but also add distractors and consume context, which can confuse generation." }
      },
      {
        id: "pathologies",
        title: "Geometry can create systematic neighbors",
        body: [
          "Embedding spaces may be anisotropic: vectors concentrate in a narrow region rather than using directions uniformly. Hubness occurs when a few items appear as nearest neighbors to many unrelated queries. Boilerplate, long documents, or frequent concepts can become hubs. Duplicate and near-duplicate chunks crowd top-k and reduce source diversity.",
          "Evaluate by slices: short versus long queries, languages, identifiers, paraphrases, and unseen product families. Negative examples should include hard near-matches, not only random irrelevant documents. For recommendation, offline neighbor quality must be separated from exposure bias and cold-start behavior.",
          "Re-embedding a corpus with a new model creates a new coordinate system. Queries and documents must use compatible encoders and versions; mixed spaces yield meaningless distance. Use an atomic index swap or dual-read validation during migration."
        ],
        code: code("python", "import numpy as np\n\ndef cosine_matrix(query, docs):\n    query = query / np.clip(np.linalg.norm(query), 1e-12, None)\n    docs = docs / np.clip(np.linalg.norm(docs, axis=1, keepdims=True), 1e-12, None)\n    return docs @ query\n\nscores = cosine_matrix(query_embedding, document_embeddings)\nindices = np.argpartition(scores, -20)[-20:]\nranked = indices[np.argsort(scores[indices])[::-1]]", [
          "Norm clipping prevents division by zero while still exposing near-zero-vector quality issues.",
          "Both query and documents use the same normalization.",
          "Partial selection avoids sorting the entire corpus in this teaching example."
        ], "It prevents magnitude from accidentally influencing a cosine contract and guards numerical failure on zero-like vectors."),
        check: { question: "Why can old document embeddings not be compared directly with query embeddings from an unrelated new model?", answer: "The two models define different coordinate systems, so dimensions and distances have no shared learned meaning." }
      }
    ],
    glossary: [
      ["Embedding", "Dense vector representation learned to expose task-relevant relationships."],
      ["Embedding space", "Coordinate system and geometry induced by an embedding model."],
      ["Cosine similarity", "Normalized dot product measuring vector angle."],
      ["Vector database", "Index and storage system optimized for vector retrieval and metadata."],
      ["Approximate nearest neighbor", "Fast neighbor search allowing bounded retrieval approximation."],
      ["Top-k", "Number of highest-ranked candidates returned."],
      ["Hybrid search", "Combination of lexical and dense retrieval signals."],
      ["Reranker", "Model that rescores query–candidate pairs after retrieval."],
      ["Anisotropy", "Embedding concentration in limited directions."],
      ["Hubness", "Tendency of some vectors to appear as neighbors for many queries."],
      ["Cold start", "Lack of historical signal for a new entity or item."]
    ],
    exercise: {
      duration: 35,
      title: "Evaluate a policy-search embedding index",
      brief: "Build a labeled set of 50 queries including paraphrases, exact policy IDs, Arabic-English variants, and no-answer cases.",
      parts: [
        "Compare cosine, dot product, dense-only, lexical-only, and hybrid candidate generation.",
        "Measure recall@k, precision@k, MRR, duplicate-source concentration, and no-answer false retrievals.",
        "Add a reranker and quantify quality versus latency.",
        "Design a safe embedding-model migration without mixing coordinate systems."
      ],
      solution: "Normalize only if required by the model. Dense should win paraphrases; lexical should protect identifiers; hybrid should improve coverage. Deduplicate or diversify chunks so one source does not occupy all slots. Choose k and threshold on labeled queries, retaining no-answer cases. During migration, build the complete new index with the new document encoder, shadow queries with the matching query encoder, compare results, then atomically switch; never query a mixed-version index."
    },
    sources: { core: ["hfTransformers","ragPaper"], deep: ["attentionPaper"] },
    quiz: [
      { concept:"Cosine similarity", prompt:"Two vectors are both unit-normalized. Their dot product equals what?", answer:2, options:[
        ["Euclidean distance squared in every case.","It is related but not identical."],
        ["Their token count.","Token count is not vector similarity."],
        ["Their cosine similarity.","Correct."],
        ["A calibrated relevance probability.","Similarity is not automatically calibrated."]
      ]},
      { concept:"Task mismatch", prompt:"A product-recommendation embedding places two items near each other. What can be safely inferred?", answer:1, options:[
        ["They have identical text meaning.","The objective may use interaction, not language semantics."],
        ["They are similar under the interaction objective and training distribution.","Correct. Interpretation is objective-bound."],
        ["They must have equal price.","No such constraint follows."],
        ["They are the same database entity.","Nearness does not prove identity."]
      ]},
      { concept:"Top-k", prompt:"A RAG system raises k from 5 to 40. Which trade-off is most direct?", answer:0, options:[
        ["Higher retrieval recall potential, but more distractors and context cost.","Correct."],
        ["Lower chance of finding evidence and zero extra tokens.","The direction is reversed."],
        ["Automatic probability calibration.","Candidate count does not calibrate scores."],
        ["The embedding dimension shrinks.","Model vectors are unchanged."]
      ]},
      { concept:"Hybrid search", prompt:"Queries contain exact incident codes plus natural-language descriptions. Why combine lexical and dense retrieval?", answer:3, options:[
        ["To eliminate authorization checks.","Security remains mandatory."],
        ["To force every result into one token.","Search mode does not compress documents."],
        ["Because dense retrieval cannot handle meaning.","Dense retrieval is designed for semantic similarity."],
        ["Lexical search protects exact terms while dense search covers paraphrases.","Correct."],
      ]},
      { concept:"Reranking", prompt:"What does a cross-encoder reranker trade for better pairwise relevance?", answer:1, options:[
        ["It removes the query.","It jointly reads query and candidate."],
        ["Additional inference latency per candidate pair.","Correct. Use it on a bounded candidate set."],
        ["It guarantees source truth.","Relevance is not truthworthiness."],
        ["It prevents all duplicates automatically.","Deduplication/diversity remains separate."]
      ]},
      { concept:"Similarity threshold", prompt:"A team treats cosine 0.8 as 80% relevance probability. Why is that invalid?", answer:2, options:[
        ["Cosine is always negative.","It can range from −1 to 1."],
        ["Probabilities cannot rank documents.","They can, but cosine is not one by default."],
        ["Similarity scale is model/corpus dependent and not probabilistically calibrated.","Correct."],
        ["0.8 is outside the cosine range.","It is inside the range."]
      ]},
      { concept:"Embedding migration", prompt:"Half the documents use embedding model A and half model B, while queries use B. What is the central defect?", answer:0, options:[
        ["Distances compare incompatible coordinate systems.","Correct. Re-embed the full searchable corpus or isolate indexes."],
        ["The corpus becomes structured data.","Representation compatibility is the issue."],
        ["Top-k must equal two.","Candidate count cannot repair geometry."],
        ["Queries become labels.","Queries remain retrieval inputs."]
      ]}
    ]
  });

  register({
    id: 22,
    centralQuestion: "When an LLM answer varies, did the instruction change, the evidence change, or the sampling process change?",
    objective: "Explain pretraining, instruction tuning, context windows, logits, temperature, top-p, and prompt roles; design constrained prompts and structured outputs while recognizing prompt limitations.",
    sections: [
      {
        id: "training-inference",
        title: "Pretraining learns token continuation; instruction tuning reshapes behavior",
        body: [
          "Autoregressive pretraining minimizes next-token prediction loss over large corpora. The model learns statistical structure, representations, and capabilities from this objective; it does not store a verified database of facts or an intrinsic instruction hierarchy. Instruction tuning then trains on prompt-response demonstrations so requested behavior becomes more likely. Preference or reinforcement methods can further shape helpfulness and safety.",
          "At inference, the model conditions on the tokens in its context and produces logits over the vocabulary. Softmax converts logits into a next-token distribution. A context window supplies temporary evidence and instructions; it does not update model weights. Fine-tuning changes parameters, while prompting changes conditional input.",
          "Because generation is sequential, an early sampled token changes the distribution of later tokens. Reproducibility depends on model revision, system prompt, template, tool outputs, sampling settings, and often a seed that may not be deterministic across hardware or providers."
        ],
        check: { question: "Why does adding a policy to the prompt not permanently teach the base model?", answer: "The policy alters the current conditioning context; it does not update the model’s learned parameters." }
      },
      {
        id: "sampling",
        title: "Temperature and top-p reshape choice, not truth",
        body: [
          "Temperature divides logits before softmax. Values below one sharpen the distribution, concentrating probability on high-logit tokens; values above one flatten it, increasing diversity and error risk. Temperature zero is commonly implemented as greedy or near-greedy selection, but provider behavior varies.",
          "Top-p nucleus sampling keeps the smallest set of highest-probability tokens whose cumulative probability reaches p, then samples within it. It adapts candidate count to model certainty. Top-k instead keeps a fixed number. Combining aggressive temperature and top-p changes two controls at once and complicates diagnosis.",
          "Lower randomness improves repeatability for extraction and code but does not guarantee factuality. If the prompt lacks evidence, greedy decoding can produce the same hallucination every time. Sampling should match the acceptable output distribution, with validation on the task."
        ],
        table: table("Generation controls", ["Control", "Direct effect", "Good fit", "Does not guarantee"], [
          ["Temperature ↓", "Sharper token distribution", "Extraction, deterministic drafting", "Truth or schema compliance"],
          ["Temperature ↑", "Flatter distribution", "Creative variants", "Useful diversity"],
          ["Top-p ↓", "Smaller cumulative nucleus", "Conservative sampling", "Factuality"],
          ["Max tokens", "Hard output cap", "Latency/cost bound", "Complete answer"],
          ["Stop sequence", "Ends on pattern", "Delimited generation", "Valid structured object"]
        ]),
        check: { question: "Why can temperature zero still hallucinate?", answer: "It selects a likely continuation deterministically; likelihood is not a factuality check and missing evidence remains missing." }
      },
      {
        id: "prompt-design",
        title: "Prompts define a contract, but the application enforces it",
        body: [
          "A system instruction states durable behavior and constraints; user input states the current request; tool and retrieved content supply data. Few-shot examples demonstrate desired mapping, including edge cases. Clear prompts specify task, permitted evidence, output schema, refusal/abstention rule, and quality criteria. Delimit untrusted content and explicitly state that it is data, not instruction.",
          "Structured output is strongest when the API constrains generation to a JSON schema or tool signature and the application validates the result. Merely asking for JSON can produce prose, missing fields, or invalid types. Validation failures need bounded repair or rejection, not an infinite retry loop.",
          "Prompts cannot securely enforce authorization, secrets, payment limits, or tool permissions. A model may ignore text under adversarial or ambiguous input. Put hard controls in code: identity checks, allowlisted tools, parameter validation, least privilege, and human approval for high-impact actions."
        ],
        example: "An invoice assistant is prompted ‘never approve above 10,000 SAR.’ If the model has an unrestricted approval tool, an injected invoice can still elicit a larger call. The service must enforce the amount rule and authorization before tool execution; the prompt provides behavior guidance and explanation, not the security boundary.",
        failure: "Adding more uppercase warnings can lengthen the prompt without creating a trusted boundary. Conflicting or malicious content is resolved probabilistically; privileges must remain outside the model.",
        check: { question: "Where should an invoice approval limit be enforced?", answer: "In deterministic authorization and business-rule code at the tool boundary, with the prompt serving only as guidance." }
      }
    ],
    glossary: [
      ["Pretraining", "Large-scale parameter learning, commonly through next-token prediction."],
      ["Instruction tuning", "Supervised adaptation toward following requested tasks and formats."],
      ["Logit", "Unnormalized model score for a candidate token."],
      ["Temperature", "Logit-scaling control that sharpens or flattens token probabilities."],
      ["Top-p", "Sampling from the smallest high-probability set reaching cumulative mass p."],
      ["Greedy decoding", "Choosing the highest-probability token at each step."],
      ["System instruction", "Highest application-supplied behavioral instruction in a chat context."],
      ["Few-shot example", "Demonstration of desired input-output behavior in context."],
      ["Structured output", "Generation constrained or validated against a machine-readable schema."],
      ["Abstention", "Deliberate refusal to answer when evidence or authorization is insufficient."]
    ],
    exercise: {
      duration: 35,
      title: "Harden an extraction prompt without pretending it is a firewall",
      brief: "Extract vendor, amount, currency, due date, and evidence spans from untrusted invoice text.",
      parts: [
        "Write system/user separation and delimit the document as data.",
        "Define a JSON schema with nullable fields and evidence spans.",
        "Compare temperature 0 and 0.7 on 20 documents with adversarial text.",
        "Implement validation, bounded retry, and a deterministic approval rule outside the LLM."
      ],
      solution: "State that invoice content may contain instructions and must only be analyzed. Use schema-constrained output where available; validate amount type, ISO currency, date, and evidence offsets. Low temperature should reduce variance but cannot prevent injection or unsupported extraction. If validation fails, retry once with the error or route to review. The approval service independently verifies identity, amount ceiling, vendor status, and human authority before action."
    },
    sources: { core: ["hfTransformers","hfTokenizers"], deep: ["attentionPaper","owaspPrompt"] },
    quiz: [
      { concept:"Pretraining", prompt:"What behavior is directly optimized in a decoder-only pretraining objective?", answer:0, options:[
        ["Predicting the next token from prior context.","Correct."],
        ["Executing authorized payments.","Tool use is an application capability, not base pretraining."],
        ["Verifying every factual claim against a database.","The objective is likelihood, not fact verification."],
        ["Calibrating business ROI.","That is outside token prediction."]
      ]},
      { concept:"Instruction tuning", prompt:"Why does an instruction-tuned model generally follow requests better than its base model?", answer:2, options:[
        ["Its tokenizer becomes infinitely large.","Vocabulary remains finite."],
        ["It has no pretraining.","Instruction tuning builds on pretraining."],
        ["Additional training makes demonstrated instruction-response behavior more likely.","Correct."],
        ["Every user message becomes trusted code.","Inputs remain untrusted."]
      ]},
      { concept:"Temperature", prompt:"Temperature falls from 1.0 to 0.2. What happens directly to the token distribution?", answer:1, options:[
        ["It becomes flatter.","Lower temperature sharpens."],
        ["It concentrates more mass on high-logit tokens.","Correct."],
        ["The context window expands.","Temperature does not change capacity."],
        ["Weights are fine-tuned.","Inference sampling does not update parameters."]
      ]},
      { concept:"Top-p", prompt:"What distinguishes top-p from top-k sampling?", answer:3, options:[
        ["Top-p changes model weights.","Both are decoding controls."],
        ["Top-p always selects one token.","Its nucleus size varies."],
        ["Top-p uses a fixed candidate count.","That is top-k."],
        ["Top-p uses the smallest candidate set reaching a cumulative probability mass.","Correct."],
      ]},
      { concept:"Factuality", prompt:"A deterministic model produces the same unsupported policy clause on every run. What does repeatability prove?", answer:0, options:[
        ["Only that decoding is stable under those conditions, not that the clause is true.","Correct."],
        ["That the clause exists in an approved source.","No grounding evidence is given."],
        ["That the model is calibrated.","Repeated text is not a probability reliability test."],
        ["That prompt injection is impossible.","Determinism does not secure instructions."]
      ]},
      { concept:"Structured output", prompt:"A prompt says ‘return JSON,’ but production requires a numeric amount and ISO date. What is still needed?", answer:2, options:[
        ["A higher temperature.","That increases variation."],
        ["A longer marketing description.","Copy does not enforce types."],
        ["Schema-constrained generation when available plus application validation.","Correct."],
        ["Trust the first brace as success.","Syntactic fragments are not validated contracts."]
      ]},
      { concept:"Security boundary", prompt:"A prompt forbids transfers above 10,000, but the model can call an unrestricted transfer API. Where is the defect?", answer:1, options:[
        ["The temperature is too low.","Sampling is not authorization."],
        ["The tool boundary lacks deterministic permission and parameter enforcement.","Correct."],
        ["The model needs more vocabulary tokens.","Vocabulary does not constrain privilege."],
        ["The response should be longer.","Length does not create a boundary."]
      ]}
    ]
  });

  register({
    id: 23,
    centralQuestion: "The answer exists in the knowledge base. Which indexing, retrieval, or context decision kept it from the model?",
    objective: "Design and evaluate a complete RAG pipeline: ingestion, chunking, embeddings, vector/lexical retrieval, filtering, top-k, query rewriting, reranking, context construction, citations, and grounded generation.",
    sections: [
      {
        id: "pipeline",
        title: "RAG separates knowledge access from language generation",
        body: [
          "Retrieval-augmented generation first indexes approved source material. Documents are parsed, normalized, divided into retrievable chunks, embedded and/or lexically indexed, and stored with metadata such as source ID, version, permissions, effective date, section path, and checksum. At query time, the system rewrites or enriches the query when useful, retrieves candidates, filters by policy, reranks, builds a bounded context, and asks the model to answer from that evidence.",
          "Retrieval changes the model’s input, not its weights. It is suitable for frequently changing private knowledge, source citations, and access-controlled corpora. A model can still hallucinate despite relevant context: it may ignore evidence, combine incompatible clauses, or make an unsupported inference. Generation policy should require citations and abstention, and evaluation must separate retrieval from answer behavior.",
          "Index lineage matters. If a policy changes, old chunks must be retired or version-filtered; otherwise the model can retrieve contradictory rules. An index build should be reproducible from document version through parser, chunker, embedding model, and index configuration."
        ],
        diagram: diagram("rag", "RAG pipeline and evidence path", ["Approved sources", "Parse + chunk + index", "Query + filters", "Retrieve + rerank", "Context + generate + cite"], [[0,1],[1,3],[2,3],[3,4]], "Evaluate the retrieval path and generation path independently before measuring the end-to-end answer."),
        check: { question: "Why does RAG not permanently teach the model a new policy?", answer: "The policy is supplied in context for a request; base parameters remain unchanged and future answers depend on retrieval succeeding again." }
      },
      {
        id: "chunking",
        title: "Chunking chooses the unit of evidence",
        body: [
          "Chunks that are too small lose qualifiers and references; chunks that are too large dilute similarity, waste context, and combine unrelated rules. Overlap can preserve sentences crossing boundaries but duplicates evidence and crowds results. Structural chunking follows headings, paragraphs, tables, or code units and often preserves meaning better than fixed token windows.",
          "Attach parent titles and section paths so an isolated paragraph retains context. Tables may need row-plus-header representations. Scanned PDFs require OCR quality checks; parser errors can turn an authoritative source into corrupt evidence. Chunk-size selection should be tested on real question–evidence labels, not decided by a universal number.",
          "Retrieval precision measures how much returned content is relevant; retrieval recall measures whether the required evidence was returned. Larger chunks and k may raise recall but lower precision. Query rewriting can resolve pronouns or add synonyms; multi-query retrieval increases coverage but also cost and duplication."
        ],
        table: table("RAG design levers", ["Lever", "Increase it", "Potential gain", "Potential harm"], [
          ["Chunk size", "More context per hit", "Qualifier coverage", "Diluted relevance and token cost"],
          ["Overlap", "Repeated boundary text", "Continuity", "Duplicate results"],
          ["Top-k", "More candidates", "Recall", "Distractors and latency"],
          ["Metadata filters", "Narrow corpus", "Authorization/relevance", "False exclusion if metadata is wrong"],
          ["Multi-query", "More query variants", "Recall for ambiguous wording", "Cost and noisy union"]
        ]),
        failure: "Chunk overlap is not free recall. If five overlapping chunks from one document occupy all top-k slots, source diversity and alternative evidence disappear. Deduplicate by span or diversify after retrieval.",
        check: { question: "Why should a table row often be indexed with its headers?", answer: "Without column meaning, isolated cell values are ambiguous and may not match or support the query." }
      },
      {
        id: "retrieval-context",
        title: "Retrieval candidates are not yet a trustworthy prompt",
        body: [
          "Dense search captures semantic similarity; lexical search protects exact terms, IDs, and rare phrases. Hybrid retrieval combines both. A reranker jointly scores query and chunk with higher precision but more latency. Metadata filters should enforce user permissions before content enters model context; asking the model to ignore unauthorized text after retrieval is not access control.",
          "Context construction removes duplicates, preserves source boundaries, orders evidence, and includes enough metadata for citations. Contradictory versions should be resolved by effective-date policy or surfaced explicitly. The system prompt should state that retrieved text is untrusted evidence and cannot override instructions—especially because a malicious document may contain prompt injection.",
          "Citations must map generated claims to exact retrieved source spans. Showing a document link does not prove the claim is entailed by it. Evaluate citation correctness and completeness, not only presence."
        ],
        code: code("python", "def build_context(query, user, k=8):\n    filters = {\"tenant_id\": user.tenant_id, \"status\": \"approved\"}\n    dense = vector_index.search(embed(query), k=40, filters=filters)\n    lexical = text_index.search(query, k=40, filters=filters)\n    candidates = reciprocal_rank_fusion(dense, lexical)\n    ranked = reranker.rank(query, deduplicate(candidates))[:k]\n    return [{\"source_id\": c.source_id, \"section\": c.section,\n             \"text\": c.text, \"version\": c.version} for c in ranked]", [
          "Authorization/status filters constrain both retrieval channels.",
          "A broad candidate stage protects recall before the slower reranker.",
          "Deduplication prevents overlapping spans from consuming all slots.",
          "Source/version metadata stays attached for citations and conflict rules."
        ], "It prevents unauthorized retrieval, dense-only identifier misses, duplicate context crowding, and untraceable citations."),
        check: { question: "Why is filtering after content reaches the LLM too late for authorization?", answer: "The sensitive content has already crossed the access boundary and may influence or appear in the output." }
      },
      {
        id: "evaluation",
        title: "Diagnose retrieval and generation separately",
        body: [
          "Build an evaluation set with answerable, unanswerable, ambiguous, multilingual, exact-ID, and permission-sensitive queries. Retrieval metrics include recall@k, precision@k, MRR, and nDCG when graded relevance exists. Generation metrics include groundedness or faithfulness to context, factual correctness against references, answer relevance, citation accuracy, and abstention quality.",
          "A wrong answer with missing evidence is primarily a retrieval failure. A wrong answer despite sufficient evidence is a generation/instruction failure. A correct answer sourced from memory despite failed retrieval is still an unreliable RAG success because the evidence path did not work. Track both components and end-to-end task utility.",
          "Latency and cost span embedding, search, reranking, prompt tokens, and generation. More retrieval stages may improve quality but violate response objectives. Choose a Pareto point and monitor by query class."
        ],
        consequence: "Optimizing only answer pleasantness can mask a retrieval system that rarely finds authoritative evidence. In production, the model’s remembered knowledge then substitutes for governed sources.",
        check: { question: "Evidence is present in top-k, but the answer contradicts it. Which subsystem leads the diagnosis?", answer: "Generation/context use: retrieval recall succeeded, so inspect ordering, contradictions, prompt instruction, and model faithfulness." }
      }
    ],
    glossary: [
      ["RAG", "Retrieval-augmented generation using external evidence in model context."],
      ["Indexing", "Transforming and storing source representations for retrieval."],
      ["Chunk", "Retrievable unit of source content."],
      ["Chunk overlap", "Repeated content across adjacent chunks to preserve boundaries."],
      ["Metadata filter", "Constraint applied to candidate documents using structured attributes."],
      ["Query rewriting", "Transforming a query to improve retrieval intent or specificity."],
      ["Multi-query retrieval", "Retrieval from several query variants whose results are combined."],
      ["Reranker", "Higher-precision model that rescores initial candidates."],
      ["Grounding", "Basing generated claims on supplied evidence."],
      ["Retrieval recall@k", "Fraction of required relevant evidence present in top k."],
      ["MRR", "Mean reciprocal rank of the first relevant result."],
      ["Citation accuracy", "Degree to which cited source spans actually support claims."]
    ],
    exercise: {
      duration: 40,
      title: "Repair a failing enterprise RAG assistant",
      brief: "Exact policy IDs fail, old versions surface, overlapping chunks dominate, and some answers cite irrelevant source pages.",
      parts: [
        "Create a 30-query diagnostic set with evidence labels and no-answer cases.",
        "Compare fixed and structural chunks, overlap settings, dense, lexical, and hybrid retrieval.",
        "Add version/permission filters, deduplication, reranking, and citation-span mapping.",
        "Classify every remaining error as retrieval, context, generation, or source-quality failure."
      ],
      solution: "Use structural chunks with headings, table headers, document version, effective date, status, tenant, and source spans. Hybrid retrieval should recover exact IDs while dense handles paraphrase. Retrieve broad candidates, deduplicate overlapping spans, rerank, then include only authorized approved versions. Evaluate recall@k/MRR before generation. For each answer, require claim-to-span citation and abstain when no supported source remains. Report latency and token changes with quality gains."
    },
    sources: { core: ["ragPaper","hfTransformers"], deep: ["owaspPrompt","hfTokenizers"] },
    quiz: [
      { concept:"RAG purpose", prompt:"A policy changes weekly and answers need citations. Why prefer RAG over relying on parametric memory?", answer:1, options:[
        ["RAG removes every hallucination.","Generation can still misuse evidence."],
        ["It retrieves current governed sources into context without retraining weights.","Correct."],
        ["It eliminates document access control.","Authorization becomes more important."],
        ["It makes tokens free.","Retrieval context adds token and system cost."]
      ]},
      { concept:"Chunk size", prompt:"Tiny chunks retrieve a sentence but omit the exception in the next paragraph. What failed?", answer:0, options:[
        ["The evidence unit lost necessary qualifying context.","Correct. Structural or larger chunks may help."],
        ["The model has too many weights.","This is an indexing boundary issue."],
        ["The user is over-authenticated.","Authorization is not the described failure."],
        ["Temperature is necessarily high.","The exception never reached context."]
      ]},
      { concept:"Hybrid retrieval", prompt:"Dense search misses code `FIN-27B` but finds semantically related manuals. Which addition is most direct?", answer:2, options:[
        ["Raise generation temperature.","Sampling cannot retrieve missing exact terms."],
        ["Remove the query code.","That discards useful evidence."],
        ["Add lexical retrieval and fuse candidates before reranking.","Correct."],
        ["Fine-tune on the answer without evaluating retrieval.","The current failure is candidate generation."]
      ]},
      { concept:"Metadata filtering", prompt:"A user lacks access to confidential documents. When must the filter apply?", answer:3, options:[
        ["After the model has summarized them.","Sensitive content already crossed the boundary."],
        ["Only when the user complains.","Access control must be proactive."],
        ["Inside a citation footnote.","Formatting is not authorization."],
        ["Before unauthorized content is retrieved into model context.","Correct."],
      ]},
      { concept:"Reranking", prompt:"Why retrieve 50 candidates and rerank to 6 instead of reranking the entire corpus?", answer:1, options:[
        ["Rerankers cannot read queries.","They jointly read query and candidate."],
        ["Candidate retrieval protects recall cheaply; expensive pair scoring is bounded.","Correct."],
        ["Six is the official number for every corpus.","k is task-dependent."],
        ["The first stage guarantees precision.","It primarily supplies candidates."]
      ]},
      { concept:"Retrieval evaluation", prompt:"The necessary clause appears at rank 4 for every answerable query. Which metric at k=5 reflects success most directly?", answer:0, options:[
        ["Recall@5","Correct. Required evidence is present within top five."],
        ["Training accuracy","No model-training result is described."],
        ["Brier score","That evaluates probabilities."],
        ["GPU utilization","That is a system metric."]
      ]},
      { concept:"Generation evaluation", prompt:"Top-k contains the correct clause, but the model states the opposite. How should the error be classified first?", answer:2, options:[
        ["Retrieval recall failure.","Required evidence was retrieved."],
        ["Index availability failure.","The index returned the clause."],
        ["Generation faithfulness/context-use failure.","Correct. Inspect contradiction handling and instruction."],
        ["A successful answer because citation exists.","Presence of a citation does not make the claim supported."]
      ]}
    ]
  });

  register({
    id: 24,
    centralQuestion: "Should you prompt, retrieve, or change model weights—and what evidence would prove the choice improved the system?",
    objective: "Choose prompting, RAG, full fine-tuning, or PEFT/LoRA; distinguish hallucination, groundedness, faithfulness, and factuality; build task, retrieval, generation, human, and LLM-as-judge evaluation with abstention.",
    sections: [
      {
        id: "intervention",
        title: "Choose the intervention that targets the failure",
        body: [
          "Prompting changes instructions and examples in context. It is fast and suitable when the base model has the capability but needs clearer task framing, output structure, or demonstrations. RAG changes available evidence and fits current, private, citable knowledge. Fine-tuning changes behavior encoded in weights and can improve style, format, domain task mapping, or efficiency at scale; it is a poor first response to facts that change weekly.",
          "Full fine-tuning updates most or all parameters and demands substantial compute, data quality, and regression control. Parameter-efficient fine-tuning updates a small parameter subset or adapters. LoRA represents weight updates through low-rank matrices, reducing trainable parameters and storage while leaving the base weights fixed. PEFT still changes behavior and needs versioning, safety evaluation, and compatible base model deployment.",
          "When not to fine-tune: the problem is missing retrieval, unclear requirements, a deterministic business rule, insufficient representative labels, or an authorization boundary. Fine-tuning can memorize sensitive examples or amplify label defects. Begin with an error taxonomy, then choose the smallest intervention aligned with cause."
        ],
        table: table("Prompting vs RAG vs fine-tuning", ["Need", "Prompting", "RAG", "Fine-tuning / LoRA"], [
          ["Current private facts", "Limited by supplied context", "Strong fit", "Stale and hard to cite"],
          ["Stable style/format", "Good baseline", "Indirect", "Strong with quality examples"],
          ["New task behavior", "Try examples first", "Only supplies evidence", "Useful if repeated and learnable"],
          ["Traceable citations", "Only if evidence supplied", "Natural fit", "Weights do not retain source links"],
          ["Change speed", "Minutes", "Index/update pipeline", "Training and release cycle"],
          ["Security control", "Not sufficient", "Still needs ACLs", "Not sufficient"]
        ]),
        check: { question: "Why is fine-tuning a poor mechanism for a policy that changes every week?", answer: "The fact becomes opaque and stale in weights; retrieval can update and cite approved sources without repeated training." }
      },
      {
        id: "failure-language",
        title: "Hallucination is broad; evaluation needs precise claims",
        body: [
          "Hallucination commonly means fluent unsupported or false content, but the term merges distinct failures. Groundedness asks whether the answer is supported by provided context. Faithfulness asks whether generated claims follow from that context without contradiction or invention. Factuality asks whether claims are true in the world or against an authoritative reference. An answer can be faithful to a malicious or outdated document yet factually wrong.",
          "Abstention is a designed output when evidence is insufficient, conflicting, unauthorized, or below confidence criteria. Evaluate both appropriate abstention and over-refusal. A system that answers only easy cases may be safe but useless; one that always answers may look helpful but invent facts.",
          "Citations are evidence interfaces. Citation correctness tests whether a cited span entails the associated claim; completeness tests whether material claims have citations. A link to a relevant document is not enough if the cited passage does not support the sentence."
        ],
        example: "A RAG assistant quotes an outdated policy retrieved from an approved but superseded document. The answer is faithful to its context but factually and operationally wrong. The primary repair is version governance and retrieval filtering, not a prompt asking the generator to ‘be more accurate.’",
        check: { question: "Can an answer be grounded yet false?", answer: "Yes. It may accurately reflect supplied context that is outdated, malicious, or itself incorrect." }
      },
      {
        id: "evaluation-stack",
        title: "Evaluate the task, retrieval, generation, and decision",
        body: [
          "Task evaluation starts from real use cases and an explicit rubric. Reference-based metrics compare with a known answer and suit extraction, classification, or constrained generation. Reference-free evaluation judges properties such as relevance, style, or groundedness from inputs and evidence. Human evaluation remains important for ambiguous utility, risk, and domain nuance.",
          "An LLM-as-judge can scale structured rubrics but introduces judge bias, position effects, verbosity preference, self-preference, and model-version drift. Calibrate it against blinded expert ratings, randomize answer order, require criterion-level evidence, and monitor disagreement. Do not use the candidate model as the sole judge of itself.",
          "For RAG, retrieval evaluation asks whether relevant evidence was returned; generation evaluation asks whether the answer used it faithfully; end-to-end evaluation asks whether the user’s task was solved safely. Aggregate scores need slice breakdowns by language, answerability, source type, risk, and query complexity."
        ],
        diagram: diagram("layers", "LLM and RAG evaluation stack", ["Task set + rubric", "Retrieval evidence", "Generation + citations", "Human/judge ratings", "Business + safety outcome"], [[0,1],[1,2],[2,3],[3,4]], "A high end score without component evidence makes failures hard to repair."),
        check: { question: "Why calibrate an LLM judge against humans?", answer: "The judge has systematic preferences and can drift; human comparison estimates whether its rubric decisions are valid for the task." }
      },
      {
        id: "release",
        title: "A fine-tuned candidate needs regression and memorization controls",
        body: [
          "Partition fine-tuning examples by entity and time when appropriate, preserve an untouched test, and deduplicate against benchmarks. Track base model, adapter, tokenizer, template, dataset version, hyperparameters, and code. Compare with prompt and RAG baselines so parameter updates must earn their operational complexity.",
          "Evaluate target-task gains, general capability regressions, safety/refusal behavior, protected or high-risk slices, latency, token use, and cost. Probe memorization with canary strings or exposure tests when sensitive training data is possible. A PEFT adapter is a deployable artifact with its own lineage and rollback path.",
          "Release decisions should use gates: minimum task score, maximum regression, supported-answer faithfulness, correct abstention, and no critical security failure. Shadow or canary traffic can validate production distribution before full promotion."
        ],
        code: code("python", "evaluation_record = {\n    \"task_id\": case.id,\n    \"answerable\": case.answerable,\n    \"retrieval_recall_at_5\": contains_required_source(top5, case),\n    \"answer_relevance\": judge.relevance(case.question, answer),\n    \"faithfulness\": judge.entailment(context, answer),\n    \"citation_correctness\": verify_citations(answer, context),\n    \"abstention_correct\": (answer.is_abstention == (not case.answerable)),\n    \"latency_ms\": trace.total_ms,\n    \"tokens\": trace.input_tokens + trace.output_tokens\n}\nassert critical_security_failures == 0\nassert slice_minimums_met(evaluation_records)", [
          "Answerability separates correct refusal from unhelpful refusal.",
          "Retrieval and generation evidence are recorded independently.",
          "Citation verification traces claims to supplied spans.",
          "Slice gates prevent a strong average from hiding a critical failure."
        ], "It prevents a fine-tuned or RAG candidate from passing on one attractive aggregate while retrieval, abstention, security, or a high-risk slice fails."),
        check: { question: "Why must a LoRA adapter have a rollback path?", answer: "It changes production behavior and depends on a specific base/tokenizer stack; a bad adapter release must be independently reversible." }
      }
    ],
    glossary: [
      ["Full fine-tuning", "Updating most or all pretrained model parameters."],
      ["PEFT", "Parameter-efficient fine-tuning that updates a small subset or adapter."],
      ["LoRA", "Low-rank parameterization of learned weight updates."],
      ["Hallucination", "Fluent content unsupported by evidence or false under the intended truth source."],
      ["Groundedness", "Degree to which an answer is based on supplied evidence."],
      ["Faithfulness", "Whether claims follow from and do not contradict supplied context."],
      ["Factuality", "Truth of claims against authoritative reality or reference."],
      ["Abstention", "Decision not to answer under insufficient evidence or authority."],
      ["Reference-based evaluation", "Comparison with known target answers or labels."],
      ["Reference-free evaluation", "Assessment from rubric, input, and context without one gold wording."],
      ["LLM-as-judge", "Language model used to score outputs against a rubric."],
      ["Judge calibration", "Validation of automated ratings against trusted human judgments."]
    ],
    exercise: {
      duration: 90,
      title: "Choose and validate an intervention for a legal-assistant failure",
      brief: "The assistant misses current internal clauses, varies its JSON, and uses the wrong professional tone. You have 2,000 approved examples and a versioned policy corpus.",
      parts: [
        "Classify each failure as evidence, format, or stable-behavior failure.",
        "Build prompting, RAG, and LoRA candidates that target only their relevant causes.",
        "Create retrieval, faithfulness, factuality, citation, schema, abstention, latency, and cost evaluations.",
        "Calibrate an LLM judge on a blinded expert subset and quantify disagreement.",
        "Write release gates, shadow criteria, and rollback identifiers; then complete the D2 domain exam."
      ],
      solution: "Use RAG for current clauses and citations; schema-constrained output plus validation for JSON; try prompt examples for tone before LoRA. Fine-tune only if stable style/format gains justify lifecycle cost. Build answerable and unanswerable cases by policy version and language. Measure retrieval recall separately; require supported claims and correct citations. Calibrate judge criterion scores against experts, randomize answer order, and keep disagreement review. Release only if all high-risk slices, abstention, and security gates pass; record base, tokenizer, prompt, index, and adapter versions for rollback."
    },
    sources: { core: ["hfPEFT","ragPaper","hfTransformers"], deep: ["nistGenAI","owaspLLM"] },
    quiz: [
      { concept:"Intervention choice", prompt:"Answers lack the latest private policy and need citations. Which first intervention targets the cause?", answer:1, options:[
        ["Full fine-tuning every week.","This is slow, opaque, and weak for citation freshness."],
        ["RAG over approved versioned policies with access filters.","Correct."],
        ["Higher temperature.","This increases variation without adding evidence."],
        ["A larger output budget only.","More tokens do not supply missing facts."]
      ]},
      { concept:"LoRA", prompt:"What does LoRA primarily reduce relative to full fine-tuning?", answer:2, options:[
        ["The need for evaluation.","Behavior still changes and needs rigorous evaluation."],
        ["The context window to zero.","Inference still uses context."],
        ["The number of trainable update parameters through low-rank adapters.","Correct."],
        ["The base model’s vocabulary automatically.","Tokenizer/vocabulary are unchanged."]
      ]},
      { concept:"When not to fine-tune", prompt:"A payment limit must never be exceeded. Why should this not be learned only through fine-tuning?", answer:0, options:[
        ["Probabilistic behavior is not a deterministic authorization boundary.","Correct. Enforce the rule in code."],
        ["Fine-tuning cannot change behavior.","It can, but not with absolute policy guarantees."],
        ["Payment amounts are always images.","They are structured values."],
        ["The limit will calibrate itself.","No automatic enforcement follows."]
      ]},
      { concept:"Faithfulness", prompt:"The context states a 30-day limit; the answer says 60 days. Which property clearly failed?", answer:3, options:[
        ["Retrieval recall, because no context existed.","The required evidence was present."],
        ["Tokenization, by definition.","No tokenization defect is established."],
        ["GPU utilization.","System load does not explain the contradiction."],
        ["Faithfulness to supplied evidence.","Correct."],
      ]},
      { concept:"Grounded but false", prompt:"An answer accurately repeats a superseded policy retrieved from the index. Which description is best?", answer:1, options:[
        ["Ungrounded and necessarily true.","It is supported by context but operationally wrong."],
        ["Faithful to retrieved context but factually stale due to source/version failure.","Correct."],
        ["Perfect because it has a citation.","Citation presence cannot override source validity."],
        ["A training-gradient failure.","The primary defect is retrieval governance."]
      ]},
      { concept:"Abstention", prompt:"A system refuses every query and therefore never hallucinates. What evaluation is missing?", answer:2, options:[
        ["Only model parameter count.","Utility is the missing dimension."],
        ["Only GPU temperature.","Hardware is irrelevant to over-refusal."],
        ["Correct-answer coverage and over-refusal on answerable cases.","Correct. Safety without utility is incomplete."],
        ["A higher refusal rate.","It is already maximal."]
      ]},
      { concept:"LLM-as-judge", prompt:"A judge consistently prefers longer answers regardless of correctness. What control helps reveal this?", answer:0, options:[
        ["Calibrate against blinded human rubric scores and include concise correct cases.","Correct."],
        ["Let the candidate judge itself only.","That compounds bias."],
        ["Remove the evaluation rubric.","That makes ratings less accountable."],
        ["Increase candidate temperature.","Sampling does not repair judge preference."]
      ]},
      { concept:"RAG evaluation", prompt:"A correct answer appears, but required evidence was absent from retrieval. Why not count this as a healthy RAG success?", answer:3, options:[
        ["Correct answers are never useful.","They are useful but the evidence mechanism failed."],
        ["Retrieval is optional in a RAG system.","It is the grounding path."],
        ["The answer must be longer.","Length does not repair provenance."],
        ["The model likely relied on parametric memory, so governed reproducibility is unproven.","Correct."],
      ]},
      { concept:"Release gates", prompt:"Average score improves, but a high-risk language slice loses 20 points and prompt-injection failures appear. What is the release decision?", answer:1, options:[
        ["Promote because the mean rose.","The critical slice and security gates fail."],
        ["Block promotion, diagnose regressions, and retain the current version.","Correct."],
        ["Delete the failing slice from the report.","That hides material risk."],
        ["Raise output length until the mean rises further.","It does not target the failures."]
      ]},
      { concept:"Adapter lineage", prompt:"Which identifiers are minimally needed to reproduce a PEFT deployment?", answer:2, options:[
        ["Adapter name only.","The adapter depends on a base stack and training context."],
        ["User browser and screen size.","These do not reproduce model behavior."],
        ["Base model/revision, tokenizer/template, adapter version, data/code/config versions.","Correct."],
        ["The latest unversioned files.","Mutable references are not reproducible."]
      ]}
    ]
  });
})();
