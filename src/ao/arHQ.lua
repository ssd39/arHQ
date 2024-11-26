---------- IMPORTS ----------

local json = require("json")

---------- GLOBALS ----------

global Name: string
Name = ao.env.Process.Tags.Name

global Description: string
Description = ao.env.Process.Tags.Description

global Members: {string: string} -- {address: name}
Members = Members or {}

global Invites: {string: string} -- {processId: code}
Invites = Invites or {}

global JoinedMembers: {string: string} -- {processId: name}
JoinedMembers = JoinedMembers or {}

---------- UTILITIES ----------

local function membersOnly(handler: function): function
  return function(message: ReceivedMessage)
    if not JoinedMembers[message.From] then
      return message.reply({Tags = {Error = "Unauthorized"}})
    end
    handler(message)
  end
end

---------- HANDLERS ----------

-- Invite Handler: Invite a user via process ID and a secret hashed code
Handlers.add(
  "Invite", "Invite",
  function(message: ReceivedMessage)
    if not message.Tags.ProcessId or not message.Tags.Code then
      return message.reply({Tags = {Error = "ProcessId and Code are required"}})
    end

    local processId = message.Tags.ProcessId
    local code = message.Tags.Code

    Invites[processId] = code

    message.reply({
      Tags = {Success = "User invited with ProcessId: " .. processId}
    })
  end
)

-- Join Handler: Validate the invite code and approve the user
Handlers.add(
  "Join", "Join",
  function(message: ReceivedMessage)
    if not message.Tags.ProcessId or not message.Tags.Code then
      return message.reply({Tags = {Error = "ProcessId and Code are required"}})
    end

    local processId = message.Tags.ProcessId
    local code = message.Tags.Code

    if Invites[processId] and Invites[processId] == code then
      JoinedMembers[processId] = message.From
      Invites[processId] = nil

      message.reply({
        Tags = {Success = "User approved with ProcessId: " .. processId}
      })

      ao.send({
        Target = Owner, -- Notify registry
        Tags = {Action = "User-Joined", ProcessId = processId}
      })
    else
      message.reply({Tags = {Error = "Invalid ProcessId or Code"}})
    end
  end
)

-- BroadcastPeer Handler: Allow only joined users to send messages
Handlers.add(
  "BroadcastPeer", "BroadcastPeer",
  membersOnly(function(message: ReceivedMessage)
    if not message.Data then
      return message.reply({Tags = {Error = "Data is required"}})
    end

    local broadcastMessage = message.Data

    for processId, _ in pairs(JoinedMembers) do
      ao.send({
        Target = processId,
        Data = broadcastMessage,
        Tags = {Action = "Broadcast-Message"}
      })
    end

    message.reply({Tags = {Success = "Message broadcasted"}})
  end)
)

-- LLamaHandler: Spawn a process for the user
Handlers.add(
  "LLamaHandler", "LLamaHandler",
  membersOnly(function(message: ReceivedMessage)
    if not message.Tags.ProcessName or not message.Tags.Action then
      return message.reply({Tags = {Error = "ProcessName and Action are required"}})
    end

    local processName = message.Tags.ProcessName
    local action = message.Tags.Action

    local spawnReply = ao.spawn(ao.env.Module.Id, {
      ["On-Boot"] = action,
      Tags = {
        Name = processName,
        Initiator = message.From
      }
    }).receive()

    if spawnReply and spawnReply.Process then
      message.reply({
        Tags = {Success = "Process spawned with ID: " .. spawnReply.Process}
      })
    else
      message.reply({Tags = {Error = "Failed to spawn process"}})
    end
  end)
)
