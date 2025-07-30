/** Creates an enhanced task prompt with Claude-Flow guidance; */
*
@param
{
  string;
}
task - The;
original;
task;
description;
*
@param
{
  Object;
}
flags - Command;
flags
 * @param {string}
instanceId - Unique;
instance;
identifier;
*
@param
{
  string;
}
tools - Comma - separated;
list;
of;
available;
tools;
*
@returns
{
  string;
}
Enhanced;
task;
prompt;

// */ // LINT: unreachable code removed
export function createEnhancedTask(task = `# Claude-Flow Enhanced Task`

#
#
Your;
Task;
$;
{
  task;
}

#
#
Claude - Flow;
System;
Context;

You;
are;
running;
within;
the;
Claude - Flow;
orchestration;
system, which;
provides;
powerful;
features;
for complex task management.

##
#
Configuration;
`
- InstanceID = `;
`
- **Parallel
Execution;
Enabled**

-Consider
both;
frontend;
and;
backend;
requirements;
-Ensure;
proper;
integration;
between;
all;
layers;
-Balance;
test;
coverage;
across;
all;
components;
-Document;
both;
API;
contracts;
and;
user;`;
interfaces`;`;
`
: ''
// }

#
#;
Commit;
Strategy;
$;
// {'
flags.commit === 'phase';''
// }
// $
// {'
  flags.commit === ''
? `- **Feature Commits**: Commit after each feature or`
namespace is
`
complete`;
`;`;
: ''
// }
// $
// {'
flags.commit === 'manual'
''
// }
// $
// {'';
// }
#
#
Additional;
Guidelines;
$;
// {
flags.noPermissions;
''
// }
// $
// {
flags.verbose
''
// }

Now, please;
proceed;
with the task: $;
// {
task;
// }'
`;
``
`;`
// return enhancedTask;
// }
`
