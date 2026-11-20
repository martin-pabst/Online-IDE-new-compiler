import * as PIXI from 'pixi.js';

export function updateWorldTransformRecursively(container: PIXI.Container, includeChildren: boolean){

    let parent = container.parent;

    if(parent){
        updateWorldTransformRecursively(parent, false);
        PIXI.updateWorldTransform(container.localTransform, parent.worldTransform, container.worldTransform);

        if(includeChildren){
            for(let child of container.children){
                updateWorldTransformRecursively(child, true);
            }
        }
    }


}

/**
 * Scale factor of the container in x-direction, without sign.
 *
 * Shapes are transformed by changing container.localTransform and then calling container.setFromMatrix(...),
 * which decomposes the matrix into position, scale, rotation and skew (PIXI.Matrix.decompose).
 * Since pixi.js 8.21 a mirrored matrix is decomposed into a negative scale.x plus a rotation by 180°
 * (before: positive scale.x plus skew). So for mirrored shapes container.scale.x is negative now.
 * Lengths (radius, width, ...) which are converted by the scale factor have to stay positive, therefore
 * use the absolute value, which is the same value older pixi.js versions returned.
 */
export function getScaleX(container: PIXI.Container): number {
    return Math.abs(container.scale.x);
}

/**
 * Scale factor of the container in y-direction, without sign (see getScaleX).
 */
export function getScaleY(container: PIXI.Container): number {
    return Math.abs(container.scale.y);
}