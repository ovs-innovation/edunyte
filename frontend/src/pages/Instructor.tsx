import Wrapper from '../layouts/Wrapper';
import InstructorMain from '../components/inner-pages/instructors/instructor';
import SEO from '../components/SEO';

const Instructor = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Instructor'} />
         <InstructorMain />
      </Wrapper>
   );
};

export default Instructor;