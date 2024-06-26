
const generatestaffId = function (surname) {
    return (
      "TEA" +
      Math.floor(100 + Math.random() * 900) +
      Date.now().toString().slice(2, 4) +
      surname
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    );
  };
  
  const isValidUserData = (userData) => {
    return userData && userData.surname && userData.othername;
  };
  

  export {
    generatestaffId,
    isValidUserData,
  }