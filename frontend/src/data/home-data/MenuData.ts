export interface MenuItem {
    id: number;
    title: string;
    titleKey?: string;
    link: string;
    menu_class?: string;
    home_sub_menu?: {
        menu_details: {
            link: string;
            title: string;
            titleKey?: string;
            badge?: string;
            badge_class?: string;
        }[];
    }[];
    sub_menus?: {
        link: string;
        title: string;
        titleKey?: string;
        dropdown?: boolean;
        mega_menus?: {
            link: string;
            title: string;
            titleKey?: string;
        }[];
    }[];
};

const menu_data: MenuItem[] = [
    // {
    //     id: 1,
    //     title: "Home",
    //     titleKey: "common.home",
    //     link: "/",
    //     menu_class: "mega-menu",
    // },
    {
        id: 3,
        title: "Courses",
        titleKey: "common.courses",
        link: "/courses",
    },
    {
        id: 2,
        title: "About Us",
        titleKey: "common.about_us",
        link: "/about-us",
    },

    {
        id: 4,
        title: "FAQ",
        titleKey: "FAQ",
        link: "/faq-one",
    },
    {
        id: 5,
        title: "Explore",
        titleKey: "common.explore",
        link: "#",
        sub_menus: [
            { link: "/our-values", title: "Our values", titleKey: "common.our_values" },
            { link: "/our-advisory_board", title: "Our advisory board", titleKey: "common.our_advisory_board" },
            { link: "/our-partners", title: "Our partners", titleKey: "common.our_partners" },
            { link: "/work-at-future-learn", title: "Work at Future Learn", titleKey: "common.work_at_future_learn" },
            { link: "/quizlet-plus", title: "Quizlet Plus", titleKey: "common.quizlet_plus" },
            { link: "/blog", title: "Blog", titleKey: "common.blog" },
            { link: "/events", title: "Events", titleKey: "common.events" },
        ]
    },
    {
        id: 6,
        title: "Community",
        titleKey: "common.community",
        link: "#",
        sub_menus: [
            { link: "/become-teacher", title: "Become Teacher", titleKey: "common.become_teacher" },
            { link: "/become-student", title: "Become a Student", titleKey: "common.become_a_student" },
            // { link: "/become-partner", title: "Become a partner", titleKey: "Become a partner" },
        ]
    }
];
export default menu_data;
