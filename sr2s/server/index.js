Meteor.onConnection(function(connection) {
  console.log(connection.clientAddress);
});
