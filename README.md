# MiniCom - Live Chat Support Demo 

Live link: https://chat-task-seven.vercel.app/ 

A real-time customer support system prototype built with Next.js, React Context, and Tailwind CSS. Demonstrates live chat between visitors and support agents with optimistic UI updates, message retry logic, and offline handling.

## Project Overview

MiniCom is a dual-app chat system similar to Intercom or Drift:

- **Mock Website** (`/`): Landing page with a floating chat widget (bottom-right button) where visitors can start support conversations
- **Agent App** (`/agent`): Support inbox with thread list, unread counts, and message history

### Key Features

- Real-time messaging via BroadcastChannel (cross-tab sync)
- Optimistic UI with message status (sending → sent → error)
- Retry failed messages
- Offline detection and handling
- Typing indicators (debounced)
- Read receipts and unread counts
- Keyboard navigation (Arrow Up/Down through threads, Enter to select)
- Dark/Light theme toggle (persisted to localStorage)
- Audio notification on new message
- Lazy message loading (load older messages on scroll)
- Responsive UI with Tailwind CSS
- Test coverage with Vitest

## Getting Started

```bash
npm install
npm run dev
```

Open two browser windows:
- Home (with chat widget): [http://localhost:3000](http://localhost:3000)
- Agent: [http://localhost:3000/agent](http://localhost:3000/agent)

Click the floating chat button in the bottom-right of the homepage to open the widget and start chatting. To test multiple visitors, use incognito windows (each gets a unique sessionStorage ID).

Run tests:
```bash
npm test
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Next.js App                         │
├─────────────────────────────────────────────────────────────┤
│  Providers (ThreadContext, ChatContext, ThemeContext)       │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────────┐
│   Mock Website      │          │    Agent App            │
│   / (homepage)      │          │    /agent               │
├─────────────────────┤          ├─────────────────────────┤
│ - ChatWidget        │          │ - AgentLayout           │
│   (floating button) │          │ - ThreadList            │
│ - ThreadView        │          │ - ThreadItem            │
│ - MessageList       │          │ - ThreadView            │
│ - ChatInput         │          │                         │
│ - MessageBubble     │          │                         │
└─────────────────────┘          └─────────────────────────┘
         │                                    │
         └────────────────┬───────────────────┘
                          ▼
            ┌─────────────────────────┐
            │  State & Persistence    │
            ├─────────────────────────┤
            │ localStorage:           │
            │  - threads              │
            │  - activeThreadId       │
            │  - theme                │
            │ sessionStorage:         │
            │  - visitorThreadId      │
            │ BroadcastChannel:       │
            │  - minicom_channel      │
            └─────────────────────────┘
```

### Data Flow

1. **Message Send**: User types → optimistic update (status: "sending") → async send → update status ("sent" or "error")
2. **Cross-tab Sync**: BroadcastChannel broadcasts message events → other tabs receive and update state
3. **Persistence**: All threads stored in localStorage, visitor ID in sessionStorage
4. **Read Receipts**: Opening a thread marks all messages as read with timestamp

### Key Files

- `src/app/page.tsx` - Mock website homepage with floating chat widget
- `src/components/visitor/ChatWidget.tsx` - Floating chat widget (button + expandable overlay)
- `src/context/ThreadContext.tsx` - Global thread state, CRUD operations
- `src/context/ChatContext.tsx` - Chat actions (send, retry, typing)
- `src/context/ThemeContext.tsx` - Theme management with early script execution
- `src/hooks/useBroadcast.ts` - BroadcastChannel wrapper for cross-tab messaging
- `src/types/chats.ts` - TypeScript types for threads, messages, senders

## State Management

### Choice: React Context

So I went into the project using React Context API since I thought it would be enough for a smallish demo project and doesn't add any additional dependencies and is usually good for cases that don't get too complex, but does have some more boilerplate associated with it.
In hindsight I could have moved the chat and thread contexts into Zustand and shortened the logic there and that would be the way to go if I was starting a larger project but I decided to keep it as is since it doesn't contain that many contexts and rerendering is not the biggest issue in the smallish app.
and keep just the theming in react context since it would help a lot with rerenders and reduced a lot of boilerplate since we would also have more contexts which would probably be this app if it scaled up a bit more.

In a production app we would probably also have a discussion about some other storages like Api responses in which case I'd probably decide for TanStack Query since that's a lot easier than writing separate handling for errors and loading. 



## AI Usage
For the project I mostly used Claude via Cursor. 
So usually I like to setup the folder and initial files myself and then go from there.
So that's what I did here. I setup the structure and then used AI to generate the base code like the component name and barebones code.
It was also a big help in setting up and consolidating the CSS/Tailwind since I started by using separate buttons and needed to see what styles are consistent it helped me format them into a single reusable component. And works a lot better if you can explain which technologies it should use, so it doesn't try to manually do something but actually uses things that it should.


### Example Prompts & Edits

**Prompt**: "Add dark/light theme support"
- AI tried to add tailwind classes dark:'something' to each classname which wasn't exactly what I wanted...
- **I rejected**: So I tried to fiddle with it a bit and explain to it how Tailwind's themes work but it was still having issues
- **Final solution**: Since the change wasn't really long I just went and updated the code myself and used AI to make the colors for each dark/light mode.


**Prompt**: "Help me figure out some test cases from these categories UI interaction, state transition, edge case based on the logic from the already existing tests"
- One of the strongest points of AI is testing, especially if you give it a few examples to check and it's usually really good at adding new ones. 
- **Result**: Most of the tests fitted very nicely with one exception where it wanted to do some weird HTML checks


**Prompt**: "Help me consolidate the styling for all used components so the same colors and sizes are used across the app"
- At the beginning when I'm just setting up the code I like to quickly write custom classnames for components, which might cause some of them to not have the same consistent styling or different colors that aren't standardized across the app. So I usually use AI to validate for me, since it can quickly check what styles are used across the app and point out the ones that aren't complying. And it enabled me to quickly setup the default colors needed in the CSS file instead of using things like bg-red-500.


**Prompt**: "Help me write the base for this readme based on the instructions (the ones from the .md)"
- So usually the hardest thing about writing is how to actually start, especially in technical documents, so that's why I like to use AI to make at least an initial base from where I can go into my own direction, which in this case I think it did quite nicely or at least I hope so for the ones reading. After the initial base it made I'm mostly writing in my own words and then will use AI at the end to consolidate what I wrote.

**Prompt**: "Create a mock website with floating chat widget like Intercom"
- AI generated a landing page with proper structure, navigation, and feature cards. The floating widget implementation with expand/collapse logic worked well on first try.
- **Manual touch-ups**: Adjusted colors to match the design system, changed copy to be more relevant, simplified button states.
- **Result**: Clean Intercom-style widget that matches the challenge requirements perfectly.


## Improvements with More Time

My planning for the project wasn't the best since a few things came up and I only had the better part of Sunday to finish it up. So there's quite a few things I would want to improve on, so this part might be a bit long. 

### Performance

For performance I would probably want to go more in depth on all the components and structures used since there might still be a context or a component causing some rerendering problems.

For the chat bubbles listing I would want to move to an infinite scroll with virtualization so it would be a lot smoother to use than clicking "load more" - it would just load more when the user gets to it. On the performance side of things some additional memos would also probably help, but a hacky way would be to use the new React compiler, which I intentionally skipped for this project since it's on the newer side of things.

### Features

For features the list is huge since an actual chat app has a long list of things. So I'll just list a few I have worked on in the past or would like to work on and skip the things like actual backend for the APIs. For larger user bases, searching by thread or by message would be important. Rich text support and one of the things I like the most in Slack - custom emojis. For usability, a big one would be having each user session be its own dynamic page which we could access by URL any time, not just in the session.

### Code Quality

In the beginning I was thinking of using Radix UI for the components but decided against it since it was mostly just buttons and a view. But I would want to expand on the reusable components side since that's always good to get out of the way early so the app is a lot easier to scale.

Connected to that I would want to also add Storybook support since if we're adding reusable components it's a lot easier to use them if you can check them in Storybook.

As always, more tests are always welcome. I stopped at a number of them since I think it showcases the logic but there is always room for more and expanding with some E2E tests and maybe a visual test.

Since it's an agent meant for user interaction, some logging and tracking would also help to get a better feeling for how the user uses it and what they expect.

In a standard project havving a history of commits or prs would be a good overview of the progress.

### UX Polish

From the visual side, the look is mostly some AI code plus my changes so it uses the correct Tailwind classes and looks at least presentable, but is still missing a lot of flair.

Would want to add some animations at least to when a message is sent/received to give the user better feedback.

Since a real project would probably use a lot more actual APIs, I would also want to add some skeleton loader support at least for the thread sidebar loading or maybe messages, along with more extended empty state support and some user tooltips.



