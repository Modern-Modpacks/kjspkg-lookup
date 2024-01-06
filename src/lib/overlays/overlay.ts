export interface OverlayProps {
	visible: boolean;
	pos: { x: number; y: number; w?: string; h?: string };
}

export function triggerOverlay(menu: HTMLElement, _: OverlayProps) {
	return {
		update: (props: OverlayProps) => {
			console.info('rerendering');
			const { visible, pos } = props;

			menu.style.display = visible ? 'block' : 'none';

			menu.style.left = pos.x + 'px';
			menu.style.top = pos.y + 'px';
			menu.style.width = pos.w || 'auto';
			menu.style.height = pos.h || 'auto';

			// Get dimensions of menu
			let menuX = menu.offsetWidth;
			let menuY = menu.offsetHeight;

			// Get viewport size
			let viewportX = window.innerWidth;
			let viewportY = window.innerHeight;

			// menu should be away from viewport border.
			if (menuX + pos.x > viewportX - 20) pos.x = viewportX - menuX - 20;
			if (menuY + pos.y > viewportY - 20) pos.y = viewportY - menuY - 20;

			menu.style.left = pos.x + 'px';
			menu.style.top = pos.y + 'px';
			menu.style.width = pos.w || 'auto';
			menu.style.height = pos.h || 'auto';
		}
	};
}

export function getPos(node: HTMLElement) {
	if (!node) return { x: 0, y: 0, w: 0, h: 0 };

	return {
		x: node.offsetLeft,
		y: node.offsetTop,
		w: node.offsetWidth,
		h: node.offsetHeight
	};
}
