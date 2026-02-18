interface DataType {
   id: number;
   page: string;
   thumb: string;
   tag: string;
   review: number;
   title: string;
   author: string;
   price: number;
};

const inner_page_course_data: DataType[] = [
   {
      id: 1,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb01.jpg",
      tag: "common.category_list.development",
      review: 4.8,
      title: "inner_courses.items.1.title",
      author: "David Millar",
      price: 15,
   },
   {
      id: 2,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb02.jpg",
      tag: "common.category_list.design",
      review: 4.5,
      title: "inner_courses.items.2.title",
      author: "David Millar",
      price: 19,
   },
   {
      id: 3,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb03.jpg",
      tag: "common.category_list.marketing",
      review: 4.3,
      title: "inner_courses.items.3.title",
      author: "David Millar",
      price: 24,
   },
   {
      id: 4,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb04.jpg",
      tag: "common.category_list.business",
      review: 4.8,
      title: "inner_courses.items.4.title",
      author: "David Millar",
      price: 12,
   },
   {
      id: 5,
      page: "inner_1",
      thumb: "/assets/img/courses/course_thumb05.jpg",
      tag: "common.category_list.data_science",
      review: 4.5,
      title: "inner_courses.items.5.title",
      author: "David Millar",
      price: 27,
   },
];

export default inner_page_course_data;