# CLAUDE.md

This is a Remotion-based video app that uses React to render videos programmatically.

Full Remotion docs: https://www.remotion.dev/docs/. Consult these docs often if you're uncertain.

## Repository Overview

This repository is in its **initial setup phase**. It contains documentation and conventions for building a Remotion video project but does not yet have scaffolded source code, dependencies, or configuration files.

### Current State

- **Framework**: Remotion (React-based video rendering)
- **Language**: TypeScript + React
- **Status**: Pre-scaffold — needs `npm init video` or manual setup to create the project structure

### Expected Project Structure (once scaffolded)

```
Adwants-/
├── CLAUDE.md                  # This file — AI assistant instructions
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── remotion.config.ts         # Remotion bundler configuration
├── src/
│   ├── Root.tsx               # Entry point — registers all compositions
│   ├── MyComp.tsx             # Main video composition component
│   └── ...                    # Additional components
├── public/                    # Static assets (images, audio, video)
└── out/                       # Rendered video output (gitignored)
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Setup (when scaffolding the project)

```bash
# Install dependencies
npm install

# Start the Remotion Studio (dev preview)
npx remotion studio
# or if scripts are defined:
npm start

# Render a video
npx remotion render MyComp out/video.mp4

# Render a still frame
npx remotion still MyComp out/frame.png
```

### Common Development Commands

| Command | Description |
|---------|-------------|
| `npx remotion studio` | Launch the Remotion Studio dev server for previewing compositions |
| `npx remotion render <comp-id> <output>` | Render a composition to a video file |
| `npx remotion still <comp-id> <output>` | Render a single frame as an image |
| `npx remotion compositions` | List all registered compositions |
| `npm run build` | Build the project (if configured) |

## Composition Defaults

When creating new compositions, use these defaults unless specified otherwise:

| Property | Default Value |
|----------|--------------|
| `fps` | `30` |
| `width` | `1920` |
| `height` | `1080` |
| `id` | `"MyComp"` |

## Project Structure Conventions

### Root File (`src/Root.tsx`)

The Root file registers all compositions and looks like this:

```tsx
import {Composition} from 'remotion';
import {MyComp} from './MyComp';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComp}
				durationInFrames={120}
				width={1920}
				height={1080}
				fps={30}
				defaultProps={{}}
			/>
		</>
	);
};
```

A `<Composition>` defines a renderable video. It requires a React `component`, an `id`, `durationInFrames`, `width`, `height`, and `fps`. The `defaultProps` must match the shape of the component's props.

### Component Structure

Components use `useCurrentFrame()` to access the current frame number (starting at 0):

```tsx
import {useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	return <div>Frame {frame}</div>;
};
```

## Component Rules

Inside a component, regular HTML and SVG tags can be returned. There are special tags for video and audio. Those special tags accept regular CSS styles.

### Video (`<OffthreadVideo>`)

```tsx
import {OffthreadVideo} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<div>
			<OffthreadVideo
				src="https://remotion.dev/bbb.mp4"
				style={{width: '100%'}}
			/>
		</div>
	);
};
```

Props: `startFrom` (trim start by frames), `endAt` (limit duration), `volume` (0–1).

### Images (`<Img>`)

```tsx
import {Img} from 'remotion';

export const MyComp: React.FC = () => {
	return <Img src="https://remotion.dev/logo.png" style={{width: '100%'}} />;
};
```

### Animated GIFs (`<Gif>`)

Requires the `@remotion/gif` package.

```tsx
import {Gif} from '@remotion/gif';

export const MyComp: React.FC = () => {
	return (
		<Gif
			src="https://media.giphy.com/media/l0MYd5y8e1t0m/giphy.gif"
			style={{width: '100%'}}
		/>
	);
};
```

### Audio (`<Audio>`)

```tsx
import {Audio} from 'remotion';

export const MyComp: React.FC = () => {
	return <Audio src="https://remotion.dev/audio.mp3" />;
};
```

Props: `startFrom` (trim start by frames), `endAt` (limit duration), `volume` (0–1).

### Static Assets (`staticFile`)

Assets in the `public/` folder are referenced via `staticFile()`:

```tsx
import {Audio, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
	return <Audio src={staticFile('audio.mp3')} />;
};
```

### Layering (`<AbsoluteFill>`)

Use `AbsoluteFill` to stack elements on top of each other (later children render in front):

```tsx
import {AbsoluteFill} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'blue'}}>
				<div>This is in the back</div>
			</AbsoluteFill>
			<AbsoluteFill>
				<div>This is in front</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```

### Timing with `<Sequence>`

Wrap elements in `Sequence` to control when they appear:

```tsx
import {Sequence, useCurrentFrame} from 'remotion';

export const Child: React.FC = () => {
	const frame = useCurrentFrame();
	return <div>At frame 10, this should be 0: {frame}</div>;
};

export const MyComp: React.FC = () => {
	return (
		<Sequence from={10} durationInFrames={20}>
			<Child />
		</Sequence>
	);
};
```

- `from`: frame number when the element appears (negative values start immediately but trim the beginning)
- `durationInFrames`: how long the element is visible
- `useCurrentFrame()` inside a Sequence resets to 0 at the Sequence start

### Sequential Elements with `<Series>`

```tsx
import {Series} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={20}>
				<div>This only appears immediately</div>
			</Series.Sequence>
			<Series.Sequence durationInFrames={30}>
				<div>This only appears after 20 frames</div>
			</Series.Sequence>
			<Series.Sequence durationInFrames={30} offset={-8}>
				<div>This only appears after 42 frames</div>
			</Series.Sequence>
		</Series>
	);
};
```

`Series.Sequence` has no `from` prop. Use `offset` to shift the start by a number of frames.

### Transitions with `<TransitionSeries>`

Requires `@remotion/transitions`.

```tsx
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

export const MyComp: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="blue" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={springTiming({config: {damping: 200}})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="black" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 30})}
				presentation={wipe()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="white" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
```

`TransitionSeries.Transition` must appear between `TransitionSeries.Sequence` tags. Order matters.

## Animation Helpers

### `interpolate()`

Animate values over time based on frame number:

```tsx
import {interpolate, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return <div style={{opacity}}>Fading in</div>;
};
```

Always add `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` by default.

### `spring()`

Physics-based spring animations:

```tsx
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const scale = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});
	return <div style={{transform: `scale(${scale})`}}>Bouncing in</div>;
};
```

### `useVideoConfig()`

Access composition metadata:

```tsx
import {useVideoConfig} from 'remotion';

export const MyComp: React.FC = () => {
	const {fps, durationInFrames, height, width} = useVideoConfig();
	return <div>{fps} fps, {width}x{height}</div>;
};
```

### `random()`

Deterministic randomness (never use `Math.random()`):

```tsx
import {random} from 'remotion';

export const MyComp: React.FC = () => {
	return <div>Random number: {random('my-seed')}</div>;
};
```

## Critical Constraints

These rules **must** be followed in all Remotion components:

1. **Deterministic rendering** — Components must produce the same output for the same frame. No `Math.random()`, no `Date.now()`, no network calls.
2. **No interactivity** — No `onClick`, `onHover`, `onChange`, or any event handlers. Components are rendered frame-by-frame, not interactively.
3. **No `useState` or `useEffect`** — Use `useCurrentFrame()` to drive all state. Calculations should be pure functions of the frame number.
4. **Frame-based animations only** — Use `interpolate()` or `spring()` keyed to frame numbers. Never use `setTimeout`, `setInterval`, `requestAnimationFrame`, or CSS transitions.
5. **Use Remotion media tags** — `<OffthreadVideo>` instead of `<video>`, `<Img>` instead of `<img>`, `<Audio>` instead of `<audio>`.
6. **Use `random()` from Remotion** — Always pass a static seed string. Never use `Math.random()`.

## Coding Conventions

- **Language**: TypeScript with React (`.tsx` files)
- **Indentation**: Tabs
- **Quotes**: Single quotes for imports and strings
- **Component style**: Functional components with `React.FC` type
- **Styling**: Inline CSS styles via the `style` prop (standard for Remotion)
- **File naming**: PascalCase for component files (e.g., `MyComp.tsx`)
- **Imports**: Named imports from `remotion` (e.g., `import {useCurrentFrame} from 'remotion'`)

## Remotion Components vs Interactive React Components

Understanding this distinction is critical when working in this codebase:

| Aspect | Remotion Components | Normal React Components |
|--------|-------------------|----------------------|
| Rendering | Frame-by-frame for video | Interactive in browser |
| State | `useCurrentFrame()` | `useState()` / `useReducer()` |
| Animations | `interpolate()` / `spring()` + frame | CSS transitions / animation libraries |
| User input | None — props set at composition time | Event handlers (click, input, etc.) |
| Side effects | None — must be pure | `useEffect()` for subscriptions |
| Determinism | Required | Not required |
