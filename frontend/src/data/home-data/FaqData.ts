interface DataType {
   id: number;
   page: string;
   question: string;
   answer: string;
   showAnswer: boolean;
};

const faq_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      question: "home.faq.questions.q1",
      answer: "home.faq.questions.a1",
      showAnswer: false,
   },
   {
      id: 2,
      page: "home_1",
      question: "home.faq.questions.q2",
      answer: "home.faq.questions.a2",
      showAnswer: false,
   },
   {
      id: 3,
      page: "home_1",
      question: "home.faq.questions.q3",
      answer: "home.faq.questions.a3",
      showAnswer: false,
   },
   {
      id: 4,
      page: "home_1",
      question: "home.faq.questions.q4",
      answer: "home.faq.questions.a4",
      showAnswer: false,
   },
];

export default faq_data;
