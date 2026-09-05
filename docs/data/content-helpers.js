(function () {
  "use strict";
  window.AcademyData = window.AcademyData || {};
  window.AcademyData.lessons = window.AcademyData.lessons || [];

  const esc = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  function question(id, concept, prompt, options, answer) {
    return {
      id,
      concept,
      prompt,
      answer,
      options: options.map((option, index) => ({
        text: option[0],
        rationale: option[1],
        correct: index === answer
      }))
    };
  }

  function table(caption, headers, rows) {
    return { caption, headers, rows };
  }

  function code(language, source, explanation, prevents) {
    return { language, source, explanation, prevents };
  }

  function diagram(type, title, nodes, edges, note) {
    return { type, title, nodes, edges, note };
  }

  function register(lesson) {
    if (!lesson || !Number.isInteger(lesson.id)) throw new Error("Lesson id is required");
    lesson.quiz = (lesson.quiz || []).map((q, index) => {
      if (q.options && q.id) return q;
      return question(`L${lesson.id}Q${index + 1}`, q.concept, q.prompt, q.options, q.answer);
    });
    window.AcademyData.lessons.push(lesson);
  }

  window.AcademyContent = { register, question, table, code, diagram, esc };
})();
