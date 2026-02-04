import Wrapper from '../layouts/Wrapper';
import InstructorAnnouncementMain from '../dashboard/instructor-dashboard/instructor-announcement';
import SEO from '../components/SEO';

const InstructorAnnouncement = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Edunyte Instructor Announcement'} />
         <InstructorAnnouncementMain />
      </Wrapper>
   );
};

export default InstructorAnnouncement;