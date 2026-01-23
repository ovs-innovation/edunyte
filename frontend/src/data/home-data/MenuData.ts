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
    {
        id: 1,
        title: "Home",
        titleKey: "common.home",
        link: "/",
        menu_class: "mega-menu",
    }
];
export default menu_data;
