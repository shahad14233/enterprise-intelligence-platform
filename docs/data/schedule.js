(function () {
  "use strict";

  const domains = {
    D1: { id: "D1", name: "Data, ML Foundations & Model Evaluation", weight: 17.3, phase: "6 Sep – 19 Sep", color: "#2f6f9f" },
    D2: { id: "D2", name: "Core AI, Deep Learning & Generative AI", weight: 16.7, phase: "20 Sep – 3 Oct", color: "#5968a8" },
    D3: { id: "D3", name: "AI Software Engineering & Integration", weight: 14.0, phase: "4 Oct – 10 Oct", color: "#397b78" },
    D4: { id: "D4", name: "MLOps, LLMOps, Deployment & Reliability", weight: 18.0, phase: "11 Oct – 31 Oct", color: "#315a8d" },
    D5: { id: "D5", name: "Architecture, Infrastructure, Performance & Scalability", weight: 12.6, phase: "1 Nov – 14 Nov", color: "#526f86" },
    D6: { id: "D6", name: "Responsible AI, Security & Governance", weight: 14.7, phase: "15 Nov – 21 Nov", color: "#7c5a83" },
    D7: { id: "D7", name: "Business, Professional Practice & Integrated Review", weight: 6.7, phase: "22 Nov – 4 Dec", color: "#7a6740" }
  };

  // Deliberately explicit. These are the only 78 study dates in the academy.
  const sessions = [
    [1,"2026-09-06","Sunday","D1",90,"Advanced","From Raw Rows to a Defensible Learning Problem"],
    [2,"2026-09-07","Monday","D1",90,"Advanced","Missingness Is a Mechanism, Not a Blank Cell"],
    [3,"2026-09-08","Tuesday","D1",90,"Advanced","One Customer or Three? Identity, Duplicates, and Contracts"],
    [4,"2026-09-09","Wednesday","D1",90,"Advanced","When Scale and Shape Rewrite the Feature Space"],
    [5,"2026-09-10","Thursday","D1",60,"Advanced","Encoding Categories Without Inventing Meaning"],
    [6,"2026-09-12","Saturday","D1",180,"Expert","Leakage: When the Future Quietly Enters Training"],
    [7,"2026-09-13","Sunday","D1",90,"Advanced","Can One Random Split Represent Production?"],
    [8,"2026-09-14","Monday","D1",90,"Advanced","The Model Fits—But Has It Learned?"],
    [9,"2026-09-15","Tuesday","D1",90,"Advanced","How Much Complexity Should the Data Be Allowed to Buy?"],
    [10,"2026-09-16","Wednesday","D1",90,"Advanced","Which Regression Error Should the Business Pay For?"],
    [11,"2026-09-17","Thursday","D1",60,"Advanced","A 99% Accurate Classifier That Finds Almost Nothing"],
    [12,"2026-09-19","Saturday","D1",180,"Expert","Your AUC Improved. Did the Decision Improve?"],

    [13,"2026-09-20","Sunday","D2",90,"Advanced","What Exactly Changes When a Neural Network Learns?"],
    [14,"2026-09-21","Monday","D2",90,"Advanced","The Loss Is Oscillating—Which Part of Optimization Failed?"],
    [15,"2026-09-22","Tuesday","D2",90,"Advanced","Why Does a Larger Network Generalize Worse?"],
    [16,"2026-09-23","Wednesday","D2",90,"Advanced","Why Can a Small Filter Recognize a Large Object?"],
    [17,"2026-09-24","Thursday","D2",60,"Advanced","What Must a Sequence Model Remember—and Forget?"],
    [18,"2026-09-26","Saturday","D2",180,"Expert","Which Tokens Should Attend, and Why?"],
    [19,"2026-09-27","Sunday","D2",90,"Expert","Encoder, Decoder, or Both: Which Transformer Fits the Job?"],
    [20,"2026-09-28","Monday","D2",90,"Advanced","The Meaning Fits, but the Tokens Do Not"],
    [21,"2026-09-29","Tuesday","D2",90,"Advanced","Nearby Vectors, Different Intent: Can Similarity Be Trusted?"],
    [22,"2026-09-30","Wednesday","D2",90,"Advanced","Should You Change the Prompt—or the Sampling Process?"],
    [23,"2026-10-01","Thursday","D2",60,"Advanced","The Answer Exists in the Corpus. Why Was It Not Retrieved?"],
    [24,"2026-10-03","Saturday","D2",180,"Expert","Prompt, Retrieve, or Fine-Tune—and How Will You Prove It Works?"],

    [25,"2026-10-04","Sunday","D3",90,"Advanced","Where Should Model Logic End and Application Logic Begin?"],
    [26,"2026-10-05","Monday","D3",90,"Advanced","It Worked Yesterday. What Changed in the Environment?"],
    [27,"2026-10-06","Tuesday","D3",90,"Advanced","Can an Inference API Reject a Bad Request Before It Harms Production?"],
    [28,"2026-10-07","Wednesday","D3",90,"Expert","Should This Request Wait, Stream, Retry, or Queue?"],
    [29,"2026-10-08","Thursday","D3",60,"Advanced","What Must Be Tested When the Output Is Probabilistic?"],
    [30,"2026-10-10","Saturday","D3",180,"Expert","How Do You Integrate an AI Service Without Trusting Every Boundary?"],

    [31,"2026-10-11","Sunday","D4",90,"Advanced","Who Owns the Model After the Notebook Ends?"],
    [32,"2026-10-12","Monday","D4",90,"Advanced","Can You Reconstruct the Run That Produced This Metric?"],
    [33,"2026-10-13","Tuesday","D4",90,"Advanced","What Should MLflow Record—and What Must Stay Outside It?"],
    [34,"2026-10-14","Wednesday","D4",90,"Expert","Which Model Version Is Production Actually Serving?"],
    [35,"2026-10-15","Thursday","D4",60,"Advanced","Code, Data, Model, Config: Which Version Caused the Change?"],
    [36,"2026-10-17","Saturday","D4",180,"Expert","Should This Candidate Be Allowed Through CI?"],
    [37,"2026-10-18","Sunday","D4",90,"Advanced","How Much Production Traffic Should a New Model Earn?"],
    [38,"2026-10-19","Monday","D4",90,"Expert","When Should the System Train Again—and Who Approves It?"],
    [39,"2026-10-20","Tuesday","D4",90,"Advanced","Does the Image Reproduce the Service—or Just Package It?"],
    [40,"2026-10-21","Wednesday","D4",90,"Advanced","A Pod Restarted. Did Kubernetes Fix the Model Service?"],
    [41,"2026-10-22","Thursday","D4",60,"Advanced","Batch, Online, or Stream: When Must the Prediction Exist?"],
    [42,"2026-10-24","Saturday","D4",180,"Expert","The Model Is Loaded. Is It Truly Ready to Serve?"],
    [43,"2026-10-25","Sunday","D4",90,"Expert","Canary, Blue-Green, or Shadow: What Risk Are You Measuring?"],
    [44,"2026-10-26","Monday","D4",90,"Expert","Rollback the Model, the Code, or the Configuration?"],
    [45,"2026-10-27","Tuesday","D4",90,"Advanced","Green Infrastructure, Broken Outcomes: Which Layer Are You Monitoring?"],
    [46,"2026-10-28","Wednesday","D4",90,"Expert","The Inputs Drifted. Did the Relationship Change Too?"],
    [47,"2026-10-29","Thursday","D4",60,"Expert","Average Latency Is Fine. Why Are Users Timing Out?"],
    [48,"2026-10-31","Saturday","D4",180,"Expert","Can You Trace One LLM Answer from Retrieval to Cost to Failure?"],

    [49,"2026-11-01","Sunday","D5",90,"Advanced","Which Work Belongs Offline, Online, or Between Them?"],
    [50,"2026-11-02","Monday","D5",90,"Advanced","The GPU Is Expensive. Is It Actually the Bottleneck?"],
    [51,"2026-11-03","Tuesday","D5",90,"Expert","Compute, Memory, or I/O: What Is Starving the Pipeline?"],
    [52,"2026-11-04","Wednesday","D5",90,"Advanced","Do You Need a Virtual Machine or an Isolated Process?"],
    [53,"2026-11-05","Thursday","D5",60,"Advanced","Who Restores the Desired State When a Node Fails?"],
    [54,"2026-11-07","Saturday","D5",180,"Expert","Can This Service Scale Without Moving Its State?"],
    [55,"2026-11-08","Sunday","D5",90,"Expert","Should This Workload Scale Up or Scale Out?"],
    [56,"2026-11-09","Monday","D5",90,"Expert","When Demand Spikes, Should You Route, Queue, or Reject?"],
    [57,"2026-11-10","Tuesday","D5",90,"Advanced","Can Batching and Caching Cut Cost Without Corrupting Semantics?"],
    [58,"2026-11-11","Wednesday","D5",90,"Expert","Throughput Rose. Why Did Tail Latency Explode?"],
    [59,"2026-11-12","Thursday","D5",60,"Advanced","Which Failure Is Still a Single Point of Failure?"],
    [60,"2026-11-14","Saturday","D5",180,"Expert","How Much Reliability Can the Budget Sustain?"],

    [61,"2026-11-15","Sunday","D6",120,"Expert","A User Said ‘Ignore Policy.’ Which Instruction Wins?"],
    [62,"2026-11-16","Monday","D6",120,"Expert","Is This a Jailbreak, Data Leak, or Both?"],
    [63,"2026-11-17","Tuesday","D6",120,"Expert","A Retrieved Document Gave the Model Orders. Who Is Trusted?"],
    [64,"2026-11-18","Wednesday","D6",120,"Expert","Was the Model Stolen, Poisoned, or Merely Fooled?"],
    [65,"2026-11-19","Thursday","D6",90,"Expert","Authenticated—but Authorized to Do What?"],
    [66,"2026-11-21","Saturday","D6",240,"Expert","How Do Guardrails, Human Oversight, and Governance Share Control?"],

    [67,"2026-11-22","Sunday","D7",120,"Expert","Is AI the Right Intervention—or an Expensive Distraction?"],
    [68,"2026-11-23","Monday","D7",120,"Expert","Whose Success Metric Decides Whether the System Worked?"],
    [69,"2026-11-24","Tuesday","D7",120,"Expert","Build, Buy, or Abstain: Where Does the Total Cost Hide?"],
    [70,"2026-11-25","Wednesday","D7",120,"Expert","When Does a Proof of Concept Become Production Evidence?"],
    [71,"2026-11-26","Thursday","D7",90,"Expert","The Model Works. Why Did Adoption Fail?"],
    [72,"2026-11-28","Saturday","D7",240,"Expert","When an AI Incident Happens, Who Owns the Next Decision?"],
    [73,"2026-11-29","Sunday","D7",120,"Expert","Can Better Metrics Rescue a Bad Business Decision?"],
    [74,"2026-11-30","Monday","D7",120,"Expert","Can the Platform Survive Both Drift and a Traffic Surge?"],
    [75,"2026-12-01","Tuesday","D7",120,"Expert","Can a Grounded RAG Answer Still Be Unsafe?"],
    [76,"2026-12-02","Wednesday","D7",120,"Expert","What Should Happen in the First Ten Minutes of a Bad Release?"],
    [77,"2026-12-03","Thursday","D7",90,"Expert","What Do Your Mock Errors Reveal About Your Reasoning?"],
    [78,"2026-12-04","Friday","D7",90,"Light review","What Must Stay Clear When the Exam Clock Starts?"]
  ].map(([id,date,day,domain,duration,difficulty,title]) => ({
    id, date, day, domain, duration, difficulty, title,
    heavy: day === "Saturday",
    finalReview: id === 78
  }));

  window.AcademyData = window.AcademyData || {};
  window.AcademyData.domains = domains;
  window.AcademyData.schedule = sessions;
  window.AcademyData.exam = {
    date: "2026-12-05",
    day: "Saturday",
    start: "15:30",
    end: "19:00",
    questions: 140,
    minutes: 210,
    note: "Exam only — no study session"
  };
})();
