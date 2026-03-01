import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const scale = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#0b1215',
			}}
		>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					color: 'white',
					fontSize: 80,
					fontWeight: 'bold',
					fontFamily: 'sans-serif',
				}}
			>
				Welcome to Adwants
			</div>
		</AbsoluteFill>
	);
};
