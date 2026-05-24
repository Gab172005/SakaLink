import React, { useState } from 'react';
import './ProfileCard.css';

const ProfileCard = () => {
  // Replace "let following = false" with React State
  const [isFollowing, setIsFollowing] = useState(false);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="card-container">
      <div className="profile-header">
        <img src="https://via.placeholder.com/100" alt="Profile" className="avatar" />
        <h2>Alex Rivera</h2>
        <p>Frontend Developer</p>
      </div>
      
      <button 
        className={isFollowing ? 'btn-unfollow' : 'btn-follow'} 
        onClick={toggleFollow}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default ProfileCard;