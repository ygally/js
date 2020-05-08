// GENERAL TOOLS BY YG
function turnArray(array, count) {
    let tmp = array.splice(0, count);
    array.push.apply(array, tmp);
    return array;
}

// GEOMETRICS TOOLS BY YG
let ABOVE = 1;
let BELOW = -1;
function newLine(slope, intercept) {
    return {
        slope: slope,
        intercept: intercept,
        f: isNaN(slope)? x => NaN: x => slope * x + intercept,
        isVertical: () => isNaN(slope),
        isHorizontal: () => !slope,
        toString: () => isNaN(slope)? 'x = '+intercept: !slope? 'y = '+intercept: 'y = '+slope+'x + '+intercept
    };
}
function newPoint(x, y) {
    const POINT = {
        x: x,
        y: y,
        round: () => {
            POINT.x = Math.round(POINT.x);
            POINT.y = Math.round(POINT.y);
            return POINT;
        },
        isRound: () => Math.round(POINT.x) == POINT.x && Math.round(POINT.y) == POINT.y,
        equals: p => POINT.x == p.x && POINT.y == p.y,
        update: p => {
            POINT.x = p.x;
            POINT.y = p.y;
            return POINT;
        },
        clone: () => newPoint(POINT.x, POINT.y),
        isAbove: line => line.isVertical()? POINT.x > line.intercept: POINT.y > line.f(POINT.x),
        isBelow: line => line.isVertical()? POINT.x < line.intercept: POINT.y < line.f(POINT.x),
        isOn: line => line.isVertical()? POINT.x == line.intercept: POINT.y == line.f(POINT.x),
        toString: () => 'pt(' + POINT.x + ',' + POINT.y + ')'
    };
    return POINT;
}
function euclidianDistance(A, B) {
    return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
}
function newLineFrom(A, B) {
    if (A.x == B.x) return newLine(NaN, A.x);
    let deno = B.x - A.x;
    return newLine((B.y - A.y) / deno, (A.y*B.x - B.y*A.x) / deno);
}
function roundPointByVector(point, vector) {
    point.x += Math.sign(vector[1].x - vector[0].x) / 2;
    point.y += Math.sign(vector[1].y - vector[0].y) / 2;
    point.round();
    return point;
}
function roundPointByTarget(point, target) {
    return roundPointByVector(point, [point, target]);
}
function movePointTowardsTarget(point, target, norme) {
    if (point.equals(target)) return point;
    norme = norme === undefined? 1: norme;
    let line = newLineFrom(point, target);
    if (line.isVertical()) {
        point.y += norme * Math.sign(target.y - point.y);
    } else {
        let sign = Math.sign(target.x - point.x);
        if (line.isHorizontal()) {
            point.x += norme * sign;
        } else {
            let distance = euclidianDistance(point, target);
            point.x += norme * (target.x - point.x) / distance;
            point.y = line.f(point.x);
        }
    }
    return point;
}
function middlePoint(A, B) {
    return newPoint((A.x + B.x)/2, (A.y + B.y)/2);
}
function imagePoint(A, I) {
    return newPoint(2 * I.x - A.x, 2 * I.y - A.y);
}
function imagePointAgainstLine(A, d) {
    if (A.isOn(d)) return A.clone();
    let perpendicular = perpendicularLine(d, A);
    // dbg('perpendicular '+perpendicular);
    let center = intersectionBetween(d, perpendicular);
    // dbg('Center '+center);
    return imagePoint(A, center);
}
function toLocalisedPointsFrom(P){
    return function(p) {
        return {
            point: p,
            distance: euclidianDistance(p, P)
        };
    };
}
function byDistance(A, B) {
    return A.distance - B.distance;
}
function byDistanceDesc(A, B) {
    return B.distance - A.distance;
}
function nearest(points, P, n) {
    return points.map(toLocalisedPointsFrom(P))
        .sort(byDistance)
        .slice(0, n)
        .map(l => l.point.clone());
}
function farest(points, P, n) {
    return points.map(toLocalisedPointsFrom(P))
        .sort(byDistanceDesc)
        .slice(0, n)
        .map(l => l.point.clone());
}
function equiDistantPoint(A, B, C) {
    let deno = 2*((A.y-C.y)*(B.x-A.x)+(B.y-A.y)*(C.x-A.x));
    // give up if 2 points are equals or 3 points in same line
    if (!deno) return null;
    let nume = (A.y-B.y)*(A.x*A.x+A.y*A.y-C.x*C.x-C.y*C.y)-(A.y-C.y)*(A.x*A.x+A.y*A.y-B.x*B.x-B.y*B.y);
    let x = nume / deno;
    let [P,Q] = A.y!=B.y? [A,B]: B.y!=C.y? [B,C]: [A,C];
    deno = 2*(P.y-Q.y);
    nume = (2*x*(Q.x-P.x)+P.x*P.x+P.y*P.y-Q.x*Q.x-Q.y*Q.y);
    let y = nume / deno;
    return newPoint(x, y);
}
function perpendicularLine(d, P) {
    //dbg('perp of ' + d + ' passant par '+P+' ...');
    if (d.isVertical()) return newLine(0, P.y);
    if (!d.slope) return newLine(NaN, P.x);
    return newLine(-1 / d.slope, (P.x + d.slope * P.y) / d.slope);
    
}
function parallelLine(d, P) {
    if (d.isVertical()) return newLine(NaN, P.x);
    if (!d.slope) return newLine(0, P.y);
    return newLine(d.slope, P.y - d.slope * P.x);
}
function perpendicularBisector(A, B) {
    let middle = middlePoint(A, B);
    return perpendicularLine(newLineFrom(A, B), middle);
}
function intersectionBetween(d, e) {
    if (d.isVertical())
        return e.isVertical()?
            null:
            newPoint(d.intercept, e.f(d.intercept));
    if (e.isVertical()) return newPoint(e.intercept, d.f(e.intercept));
    if (d.slope == e.slope) return null;
    let x = (e.intercept - d.intercept) / (d.slope - e.slope);
    return newPoint(x, d.f(x));
}
function intersectionWithSegmentLine(d, A, B) {
    return intersectionBetween(d, newLineFrom(A, B));
}
function indexOfPoint(points, point) {
    for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].equals(point)) {
            return i;
        }
    }
    return -1;
}
function isOnSegment(A, B, point) {
    if (!point.isOn(newLineFrom(A, B))) return false;
    let segmentSize = euclidianDistance(A, B);
    return euclidianDistance(point, A) <= segmentSize && euclidianDistance(point, B) <= segmentSize;
}
function isOutOfSegment(A, B, point) {
    return !isOnSegment(A, B, point);
}
function halfSegmentFromTriangleAtAnyPoint(vertices, M) {
    [A,B,C] = vertices;
    vertices = isOnSegment(A, B, M)? [A,B,C]: isOnSegment(B, C, M)? [B,C,A]: isOnSegment(A, C, M)? [C,A,B]: null;
    if (!vertices) return null;
    [A,B,C] = vertices;
    let J = middlePoint(A, B);
    [A,B] = isOnSegment(A, J, M)? [A,B]: [B,A];
    let lineJN = parallelLine(newLineFrom(M, C), J);
    let N = intersectionWithSegmentLine(lineJN, B, C);
    return [M, N];
}
function halfSegmentFromTriangleVertex(vertices, M) {
    let index = indexOfPoint(vertices, M || vertices[0]);
    if (index < 0) return halfSegmentFromTriangleAtAnyPoint(vertices, M);
    [A,B,C] = turnArray(vertices.slice(), index);
    return [A, middlePoint(B, C)];
}
function gravityCenter(A, B, C) {
    let median1 = newLineFrom(A, middlePoint(B, C));
    return intersectionWithSegmentLine(median1, B, middlePoint(A, C));
}
function isOutOfPolygon(points, point) {
    let len = points.length;
    for (let i=0, j=len-1, k=len-2; i<len; k=j, j=i++) {
        let line = newLineFrom(points[i], points[j]);
        if (points[k].isAbove(line)) {
            if (point.isBelow(line)) return true;
        } else if (point.isAbove(line)) return true;
    }
    return false;
}
function isOutOfZone(points, point) {
    if (points.length < 3) {
        return isOutOfSegment(points[0], points[1], point);
    }
    return isOutOfPolygon(points, point);
}
function getPointsBetween(A, B) {
    let norme = 1;
    if (A.x != B.x && A.y != B.y) {
        let abscisseCnt = B.x - A.x;
        norme = Math.sqrt(Math.pow(B.y - A.y, 2) + Math.pow(abscisseCnt, 2)) / abscisseCnt;
    }
    let point = A.clone();
    let list = [];
    for (point = movePointTowardsTarget(A.clone(), B, norme);
        !B.equals(point) && !isOutOfSegment(A, B, point);
        point = movePointTowardsTarget(point.clone(), B, norme)) {
            list.push(point);
    }
    return list;
}
function projectOnSegment(A, B, point) {
    let line = newLineFrom(A, B);
    dbg('seg line '+line);
    let perp = perpendicularLine(line, point);
    dbg('perp through ' + point + ' = '+perp);
    return intersectionBetween(line, perp);
}
function deduplicateZone(points) {
    let j = points.length - 1, i;
    for (i = 0; i < points.length; j = i++) {
        let a = points[j];
        let b = points[i];
        if (a.equals(b)) {
            if (i) {
                points.splice(i, 1);
                i = j;
            } else {
                points.splice(j, 1);
            }
        }
    }
    return points;
}
function halfSegmentFromQuadrilateralAtAnyPoint(vertices, point) {
    // FIXME do it when point is not one of the 4 vertices
    return null;
}
function halfSegmentFromQuadrilateralFirstVertex(vertices) {
    let [A, B, C, D] = vertices;
    dbg('ABCD = '+vertices);
    let lineAC = newLineFrom(A, C);
    let lineCD = newLineFrom(C, D);
    let E = intersectionBetween(lineCD, parallelLine(lineAC, B));
    dbg('E = '+E);
    let midED = middlePoint(E, D);
    let N = !isOutOfSegment(C, D, midED)?
        midED:
        intersectionBetween(parallelLine(lineAC, midED), newLineFrom(B,C));
    return [A.clone(), N];
}
function halfSegmentFromQuadrilateralVertex(vertices, M) {
    let index = indexOfPoint(vertices, M || vertices[0]);
    if (index < 0) return halfSegmentFromQuadrilateralAtAnyPoint(vertices, M);
    vertices = turnArray(vertices.slice(), index);
    return halfSegmentFromQuadrilateralFirstVertex(vertices);
}
function cutZoneWithLine(points, line, side, directionVector) {
    side = side > 0? 'isAbove': 'isBelow';
    dbg('Cutting '+side+' ' + line + ' of Zone '+points);
    let len = points.length, virgin = true;
    dbg('- cut: Zone has '+len +' vertices');
    let toRemove = [];
    for (let j = len - 1, i = 0; i < points.length; j = i++) {
        let a = points[j];
        let b = points[i];
        if (!a.isOn(line) && !b.isOn(line) && a[side](line) != b[side](line) && (virgin || len > 2)) {
            let p = intersectionWithSegmentLine(line, a, b);
            dbg('- cut: adds one intersection ' + p);
            if (len > 2) {
                if (directionVector && !p.isRound()) {
                    roundPointByVector(p, directionVector);
                }
                p.round();
                dbg('- cut: rounded intersection ' + p);
            }
            points.splice(i, 0, p);
            dbg('- cut: added '+p+' => ' + points);
            virgin = false;
            j = i++;
        }
        if (b[side](line)) {
            dbg('- cut: '+b+' '+side+' ' + line + ' => added to trash list');
            toRemove.push(i);
        }
    }
    dbg('- cut: going to sort (desc) indices to remove ' + toRemove);
    dbg('- cut:   then remove them from zone '+points);
    toRemove.sort((a,b) => b-a)
        .reduce((p, c) => {
            let r = p.splice(c, 1);
            dbg('removed i [=' + c + '] from zone ' + r);
            return p;
        }, points);
    dbg('- cut: going to dedupl zone ' + points);
    deduplicateZone(points);
    dbg('- cut: deduplicated '+ points);
    return points;
}
function zoneIntersectionsWith(points, line, side) {
    side = side > 0? 'isAbove': 'isBelow';
    let len = points.length, j = len - 1, i, inter = [];
    for (i = 0; i < len; j = i++) {
        let a = points[j];
        let b = points[i];
        if (a[side](line) != b[side](line)) {
            inter.push(intersectionWithSegmentLine(line, a, b));
            if (inter.length == 2) return inter;
        }
    }
    return inter;
}
function nextPointOnSegment(A, B) {
    let dx = Math.sign(B.x - A.x);
    let dy = Math.sign(B.y - A.y);
    if (!dx) return newPoint(A.x, A.y + dy);
    return newPoint(A.x + dx, newLineFrom(A, B).f(A.x + dx));
}
function cutFirstOffLineZone(lineZone) {
    let p = nextPointOnSegment(lineZone[0], lineZone[1]);
    while (!p.isRound() && !p.equals(lineZone[1])) {
        if (isOutOfSegment(lineZone[0], lineZone[1], p)) {
            dbg(p + ' out of segment bound ' + lineZone[0] + '-' + lineZone[1]);
            return lineZone;
        }
        p = nextPointOnSegment(p, lineZone[1]);
    }
    lineZone[0] = p;
    return lineZone;
}
function cutLastOffLineZone(lineZone) {
    let zoneCopy = cutFirstOffLineZone([lineZone[1], lineZone[0]]);
    lineZone[0] = zoneCopy[1];
    lineZone[1] = zoneCopy[0];
    return lineZone;
}
function cutOffPointIfBound(zone, point) {
    if (zone[0].equals(point)) {
        cutFirstOffLineZone(zone);
    } else if (zone[1].equals(point)) {
        cutLastOffLineZone(zone);
    }
    return zone;
}