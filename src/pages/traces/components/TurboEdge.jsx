import { memo } from 'react';
import PropTypes from 'prop-types';
import { getBezierPath } from 'reactflow';

const TurboEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const adjustedSourceX = sourceX === targetX ? sourceX + 0.0001 : sourceX;
  const adjustedSourceY = sourceY === targetY ? sourceY + 0.0001 : sourceY;
  const edgePath = getBezierPath({
    sourceX: isNaN(adjustedSourceX) ? 0 : adjustedSourceX,
    sourceY: isNaN(adjustedSourceY) ? 0 : adjustedSourceY,
    sourcePosition,
    targetX: isNaN(targetX) ? 0 : targetX,
    targetY: isNaN(targetY) ? 0 : targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
});

TurboEdge.displayName = 'TurboEdge';

TurboEdge.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.string.isRequired,
  targetPosition: PropTypes.string.isRequired,
  style: PropTypes.object,
  markerEnd: PropTypes.string,
};

export default TurboEdge;
