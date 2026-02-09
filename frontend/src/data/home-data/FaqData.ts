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
      question: "Why should I choose Edunyte for learning?",
      answer: "Because Edunyte offers flexible, skill-based courses taught by expert instructors in multiple languages.",
      showAnswer:false,
   },
   {
      id: 2,
      page: "home_1",
      question: "Can I learn skills in my local language?",
      answer: "Yes, courses are available in Hindi, English, and other regional languages for easy understanding.",
      showAnswer:false,
   },
   {
      id: 3,
      page: "home_1",
      question: "Are the courses taught by certified experts?",
      answer: "Absolutely. All courses are delivered by verified and experienced professionals.",
      showAnswer:false,
   },
   {
      id: 4,
      page: "home_1",
      question: "Is Edunyte affordable for students?",
      answer: "Yes, Edunyte provides high-quality education at student-friendly and affordable prices.",
      showAnswer:false,
   },
];

export default faq_data;
