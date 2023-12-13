var latestMessages = {};

// Dictionary to track the visibility state of reply fields and send buttons
var replyFieldsState = {};

// Dictionary to store the "Send" button for each user
var sendButtons = {};

// Function to toggle the visibility of the reply field and send button for a specific user
function toggleReplyField(sender, messageId) {
    var replyField = document.getElementById('replyField-' + messageId);  // Use messageId instead of sender

     // Initialize to false if undefined
    replyFieldsState[messageId] = replyFieldsState[messageId] || false;

    // Toggle the visibility state
    replyFieldsState[messageId] = !replyFieldsState[messageId];  // Use messageId instead of sender

    // Toggle the visibility of the reply field
    if (replyField) {
        replyField.classList.toggle('d-none', !replyFieldsState[messageId]);

        // Create or get the "Send" button for the specific messageId
        if (!sendButtons[messageId]) {
            sendButtons[messageId] = createSendButton(sender, messageId);
        }

        // Toggle the visibility of the "Send" button
        sendButtons[messageId].classList.toggle('d-none', !replyFieldsState[messageId]);
    }
}

// Create a "Send" button for a specific user
function createSendButton(sender, messageId) {

    var sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.className = 'btn btn-primary mt-2 d-none';  // Initially hide the button
    sendButton.id = 'sendButton-' + messageId;

    // Use an anonymous function to capture the current values of sender and messageId
    sendButton.onclick = function () {
        sendReply(sender, messageId);
    };

    // Append the "Send" button directly to the latestMessages[sender] element
    var messageElement = latestMessages[sender];
    if (messageElement) {
        messageElement.appendChild(sendButton);
    } else {
        console.error('Message element not found for sender:', sender);
    }

    return sendButton;
}

function sendMessage() {
    // Get the message content from the input field
    var messageContent = document.getElementById('messageContent').value;

    if (!messageContent.trim()) {
        // If content is empty or contains only whitespace, don't send the message
        return;
    }

    // Send the message via AJAX
    fetch('/windwood/chatroom/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: 'content=' + encodeURIComponent(messageContent),
    })
    .then(response => response.json())
    .then(data => {
        // Update the chat container with the latest message and messageId
        updateChatContainer(data.message, data.messageId);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateChatContainer(message) {
   
    // Get the username, content, and created timestamp from the message
    var sender = message.sender;
    var content = message.content;
    var created = message.created;
    var messageId = message.id;  // Assuming the message object has an 'id' property

    // Check if the user already has a message in the chat container
    if (sender in latestMessages) {
        // Update the existing message
        latestMessages[sender].innerHTML ='<i class="fas fa-comment text-success"></i> ' + '<span style="font-weight: bold;">' + sender + ':</span> <span style="color: green;">' + content + '</span> - sent on ' + created;

        // Add a reply button
        var replyButton = document.createElement('button');
        replyButton.textContent = 'Reply';
        replyButton.className = 'btn btn-sm btn-outline-primary ms-2 mb-3 mt-2';
        replyButton.onclick = function () {
            toggleReplyField(sender, messageId);
        };

        // Append the reply button to the message element
        latestMessages[sender].appendChild(replyButton);

        // Add a hidden text field for replying
        var replyField = document.createElement('textarea');
        replyField.className = 'form-control mt-2 d-none';
        replyField.placeholder = 'Reply to ' + sender + '...';
        replyField.id = 'replyField-' + messageId;

        // Append the reply field to the chat container
        latestMessages[sender].appendChild(replyField);

        // Add a hidden section for displaying replies
        var repliesSection = document.createElement('div');
        repliesSection.className = 'replies-section mt-2 d-none';
        repliesSection.id = 'repliesSection-' + messageId;

        // Append the replies section to the message element
        latestMessages[sender].appendChild(repliesSection);

        // Display existing replies
        if (message.replies && message.replies.length > 0) {
            var repliesList = document.createElement('ul');
            repliesList.className = 'list-unstyled';
            message.replies.forEach(function(reply) {
                var replyItem = document.createElement('li');
                repliesSection.className = 'me-3';
                replyItem.innerHTML = '<span style="margin-left: 30px;"><i class="fas fa-comments text-success"></i> ' + '<span style="font-weight: bold;">' + reply.sender + '</span> Replied: <span style="color: green;">' + reply.content + '</span></span>';
                repliesList.appendChild(replyItem);
            });
            repliesSection.appendChild(repliesList);
        }
      
    } else {
        // Create a new message element
        var messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = '<span style="font-weight: bold;">' + sender + ':</span> <span style="color: green;">' + content + '</span> - sent on ' + created;

        // Add a reply button
        var replyButton = document.createElement('button');
        replyButton.textContent = 'Reply';
        replyButton.className = 'btn btn-sm btn-outline-primary ms-2';
        replyButton.onclick = function () {
            toggleReplyField(sender, messageId);
        };

        // Append the reply button to the message element
        messageElement.appendChild(replyButton);

        // Add a hidden text field for replying
        var replyField = document.createElement('textarea');
        replyField.className = 'form-control mt-2 d-none';
        replyField.placeholder = 'Reply to ' + sender + '...';
        replyField.id = 'replyField-' + messageId;

        // Append the reply field to the chat container
        messageElement.appendChild(replyField);

        // Add a hidden section for displaying replies
        var repliesSection = document.createElement('div');
        repliesSection.className = 'replies-section mt-2 d-none';
        repliesSection.id = 'repliesSection-' + messageId;

        // Append the replies section to the message element
        messageElement.appendChild(repliesSection);

        // Display existing replies
        if (message.replies && message.replies.length > 0) {
            var repliesList = document.createElement('ul');
            repliesList.className = 'list-unstyled';
            message.replies.forEach(function(reply) {
                var replyItem = document.createElement('li');
                replyItem.innerHTML = '<span style="font-weight: bold;">' + reply.sender + ':</span> ' + reply.content;
                repliesList.appendChild(replyItem);
            });
            repliesSection.appendChild(repliesList);
        }

        // Append the message to the chat container
        document.getElementById('chat-container').appendChild(messageElement);

        // Store the latest message for the user
        latestMessages[sender] = messageElement;
    }
}

function sendReply(sender, messageId) {
    var replyField = document.getElementById('replyField-' + messageId);
   
    if (replyField) {
        var replyContent = replyField.value.trim();

        if (replyContent) {
    
            // AJAX request to save the reply
            fetch('/windwood/chatroom/' + messageId + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ content: replyContent }),
            })
            .then(response => response.json())
            .then(data => {
              
                // Optionally, clear the reply field after a successful reply
                replyField.value = '';

                // Hide the reply field and the "Send" button
                toggleReplyField(sender, messageId);
                 // Update the replies section with the new reply
                updateRepliesSection(sender, messageId, data.reply);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            console.error('Reply content is empty for sender:', sender);
        }
    } else {
        console.error('Reply field not found for sender:', sender);
    }
}

async function updateRepliesSection(messageId, reply) {
    var repliesSection = document.getElementById('repliesSection-' + reply);

    if (repliesSection) {
        repliesSection.classList.remove('d-none');

        // Clear existing content in the replies section
        repliesSection.innerHTML = '';

        // Fetch the original message using the reply ID
        try {
            const response = await fetch('/fetch_message_with_replies/' + reply + '/');
            const originalMessage = await response.json();
           
            // Check if there are replies in the original message object
            if (originalMessage.message.replies && originalMessage.message.replies.length > 0) {
                
                // Create an unordered list to contain the replies
                var repliesList = document.createElement('ul');
                repliesList.className = 'list-unstyled';

                // Iterate through each reply and append it to the list
                originalMessage.message.replies.forEach(function (replyItem) {
                    var replyItemElement = document.createElement('li');
                    replyItemElement.innerHTML = '<span style="font-weight: bold;">' + replyItem.sender + ':</span> ' + replyItem.content;
                    repliesList.appendChild(replyItemElement);
                });

                // Append the list of replies to the replies section
                repliesSection.appendChild(repliesList);
            } else {
                // If there are no replies, display a message
                var noRepliesMessage = document.createElement('p');
                noRepliesMessage.textContent = 'No replies yet.';
                repliesSection.appendChild(noRepliesMessage);
            }

            // Display the reply text field and send button
            var replyField = document.createElement('textarea');
            replyField.className = 'form-control mt-2';
            replyField.placeholder = 'Reply to ' + originalMessage.message.sender + '...';
            replyField.id = 'replyField-' + reply;

            var sendButton = document.createElement('button');
            sendButton.textContent = 'Send';
            sendButton.className = 'btn btn-primary mt-2';
            sendButton.id = 'sendButton-' + reply;

            sendButton.onclick = function () {
                sendReply(originalMessage.message.sender, reply);
            };

            // Append the reply field and send button to the replies section
            repliesSection.appendChild(replyField);
            repliesSection.appendChild(sendButton);
        } catch (error) {
            console.error('Error fetching original message:', error);
        }
    } 
}

// Function to get CSRF token from cookies
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// Load messages on page load
// Load messages on page load
$(document).ready(function() {
    // Make an AJAX request to fetch and display existing messages
    $.ajax({
        type: 'GET',
        url: fetchMessagesUrl,  // Use the variable here
        success: function(data) {
            if (data.success) {
                // Append each existing message to the chat container
                data.messages.forEach(function(message) {
                    // Update the chat container with the latest message
                    updateChatContainer(message);
                });
            } else {
                // Handle failure if needed
            }
        },
        error: function() {
            // Handle error if needed
        }
    });
});
