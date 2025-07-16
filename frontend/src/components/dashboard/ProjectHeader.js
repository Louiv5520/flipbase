import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import './ProjectHeader.css';

const ProjectHeader = ({ user }) => {

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'Godmorgen';
    if (hour < 18) return 'God formiddag';
    return 'God aften';
  };

  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0].slice(0, 2);
  };

  const renderAvatar = () => {
    if (user.profilePicture) {
      return <img src={`/${user.profilePicture}`} alt={user.name} className="profile-picture-header" />;
    }
    return (
      <div className="initials-avatar-header">
        {getInitials(user.name)}
      </div>
    );
  };


  return (
    <div className="project-header-simple">
      <div className="greeting-section">
        {renderAvatar()}
        <h1>{getGreeting()}, {user.name} <FaLightbulb style={{ color: '#f39c12' }} /></h1>
      </div>
    </div>
  );
};

export default ProjectHeader; 