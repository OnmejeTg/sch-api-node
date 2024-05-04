const isValidUserData = (userData) => {
    return userData && userData.username && userData.password;
  };

  export{isValidUserData}