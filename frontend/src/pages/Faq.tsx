import Wrapper from '../layouts/Wrapper';
import SEO from '../components/SEO';
import HeaderOne from '../layouts/headers/HeaderOne';
import FooterOne from '../layouts/footers/FooterOne';
import FaqArea from '../components/homes/home-one/FaqArea';
import BreadcrumbOne from '../components/common/breadcrumb/BreadcrumbOne';
const FaqPage = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Edunyte FAQ'} />
      <HeaderOne />
      <main className="main-area fix glow-bg">
        <BreadcrumbOne title={"Frequently Asked Questions"} sub_title={"FAQ"} />
        <div className="section-pb-120">
            <FaqArea />
        </div>
      </main>
      <FooterOne style={false} style_2={false} />
    </Wrapper>
  );
};

export default FaqPage;
