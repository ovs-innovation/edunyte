import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import AOS from "aos";
import MotionAnimation from "../hooks/MotionAnimation";
import ScrollToTop from "../components/common/ScrollToTop";

interface WrapperProps {
    children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {

    useEffect(() => {
        AOS.init();
    }, []);

    MotionAnimation();

    return (
        <>
            {children}
            <ScrollToTop />
            <ToastContainer
                position="top-center"
                autoClose={4500}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnHover
                style={{ zIndex: 99999999999, top: "95px" }}
            />
        </>
    );
}

export default Wrapper;
