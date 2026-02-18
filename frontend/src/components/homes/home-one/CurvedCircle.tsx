import React, { useEffect, useRef } from 'react';
import CircleType from 'circletype';
import { useTranslation } from 'react-i18next';

const CurvedCircle: React.FC = () => {
  const { t } = useTranslation();
  const curvedCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (curvedCircleRef.current) {
      const circleType = new CircleType(curvedCircleRef.current);
      circleType.radius(280).dir(1); // Customize as needed
    }
  }, [t]);

  return (
    <div className="curved-circle" ref={curvedCircleRef}>
      {t('common.curved_circle_text')}
    </div>
  );
};

export default CurvedCircle;


