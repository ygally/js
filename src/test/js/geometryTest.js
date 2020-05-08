// import * from "geometry.js"

// UNIT TESTS
pt = newPoint;
dbg = console.error;

[A,B,C] = [pt(2,1),pt(2,3),pt(4,1)];
e = equiDistantPoint(A,B,C);
assert(e.x==3&&e.y==2, "point e should have coordinates [3,2]");

line = newLineFrom(pt(0,0), pt(2,2));
assert(!line.isVertical(), "line shouldn't be vertical");
assert(line.slope == 1, "slope of line should be 1");
assert(line.intercept == 0, "intercept of line should be 0");
assert(line.f(2)==2, "line should contain point [2,2]");
line = newLineFrom(pt(0,1), pt(2,5))
assert(line.f(-2) == -3, "line should contain point [-2,-3]");

attended = 5;
[A, B] = [pt(3, 4), pt(0,0)];
distance = euclidianDistance(A, B);
assert(distance == attended, "distance between points should be 5");

zone = [pt(3,9),pt(2,7),pt(2,1),pt(4,0),pt(6,7),pt(4,9)];
P = pt(7,2);
[A, B, C] = farest(zone, P, 3);
assert(A.equals(pt(3,9)) && B.equals(pt(4,9)) && C.equals(pt(2,7)), "farest points from [7;2] are wrong");
e = equiDistantPoint(A,B,C);
e.round();
assert(e.equals(pt(4,8)), "equidistant point should be [4;8]");

middle = middlePoint(P, e);
assert(middle.x == 5.5 && middle.y == 5, "middle of P & e should be [5.5;5]");
bisector = perpendicularBisector(P, e);
assert(bisector.f(middle.x) == middle.y, "middle of P & e should be on the bisector line");

[A, B, P] = [pt(2,6), pt(6,8), pt(8,3)];
d = newLineFrom(A, B);
parallel = parallelLine(d, P);
assert(parallel.intercept == -1, "intercept of 1st parallel line should be -1");
assert(pt(2,0).isOn(parallel), "1st parallel line should go through point " + pt(2,0));

[A, B, P] = [pt(5,4), pt(5,10), pt(8,3)];
d = newLineFrom(A, B);
parallel = parallelLine(d, P);
assert(isNaN(parallel.f(0)), "intercept of 2nd parallel line should be NaN (because it is vertical)");
assert(parallel.intercept == 8, "x axis intercept of 2nd parallel line should be 8");
assert(pt(8,0).isOn(parallel), "2nd parallel line should go through point " + pt(8,0));

[A, B, P] = [pt(3,1), pt(7,1), pt(8,4)];
d = newLineFrom(A, B);
parallel = parallelLine(d, P);
assert(parallel.f(0) == 4, "intercept of 3rd parallel line should be 4 (horizontal line)");
assert(pt(12,4).isOn(parallel), "3rd parallel line should go through point " + pt(12,4) + " (horizontal line)");

line = newLine(1/2, 6);
inter = intersectionWithSegmentLine(line, pt(4,0), pt(4,9));
assert(inter.equals(pt(4,8)), "intersection with vertical should be [4;8]");
inter = intersectionWithSegmentLine(line, pt(6,8), pt(4,9));
assert(inter.equals(pt(5,8.5)), "intersection with vertical should be [5;8.5]");


triZone = [pt(5,12), pt(6,15), pt(1,16)];
[M, N] = halfSegmentFromTriangleVertex(triZone);
assert(M.equals(triZone[0]), "first point of half segment should be the first vertex of triangle " + triZone[0]);
assert(N.equals(pt(3.5,15.5)), "second point of half segment should be " + pt(3.5,15.5));

triZone = [pt(5,12), pt(6,15), pt(1,16)];
[M, N] = halfSegmentFromTriangleVertex(triZone, pt(3,14));
assert(M.equals(pt(3,14)), "first point of half segment should be the first vertex of triangle " + pt(3,14));
assert(N.equals(pt(6,15)), "second point of half segment should be " + pt(6,15));

triZone = [pt(5,12), pt(6,15), pt(1,16)];
[M, N] = halfSegmentFromTriangleVertex(triZone, pt(4,13));
assert(M.equals(pt(4,13)), "first point of half segment should be the first vertex of triangle " + pt(4,13));
assert(N.x > 4 && N.x < 4.5 && N.y > 15 && N.y < 15.5, "second point of half segment should be between " + pt(4,15) + " & " + pt(4.5,15.5));

zoneQuad = [pt(0,0), pt(7,10), pt(6,12), pt(0,14)];
[M, N] = halfSegmentFromQuadrilateralVertex(zoneQuad);
assert(M.equals(zoneQuad[0]), "first point of half segment should be the first vertex of polygon " + zoneQuad[0]);
assert(N.x > 3 && N.x < 4 && N.y > 12 && N.y < 13, "second point of half segment should be between " + pt(3,12) + " & " + pt(4,13));

zoneQuad = [pt(0,0), pt(0,16), pt(6,12), pt(7,10)];
[M, N] = halfSegmentFromQuadrilateralVertex(zoneQuad, pt(6,12));
assert(M.equals(zoneQuad[2]), "first point of half segment should be the third vertex of polygon " + zoneQuad[2]);
assert(N.equals(pt(0,6)), "second point of half segment should be " + pt(0,6));

zoneQuad = [pt(0,0), pt(7,10), pt(6,12), pt(0,16)];
[M, N] = halfSegmentFromQuadrilateralVertex(zoneQuad, pt(6,12));
assert(M.equals(zoneQuad[2]), "first point of half segment should be the third vertex of polygon " + zoneQuad[2]);
assert(pt(0,6).equals(N), "half segment line should be " + pt(0,6));

zoneQuad = [pt(2,0), pt(10,2), pt(9,6), pt(1,4)];
[M, N] = halfSegmentFromQuadrilateralVertex(zoneQuad, pt(2,0));
assert(M.equals(zoneQuad[0]), "first point of half segment should be the first vertex of parallelogram " + zoneQuad[0]);
assert(N.equals(zoneQuad[2]), "second point of half segment should be the third vertex of parallelogram " + zoneQuad[2]);

assert(!isOutOfZone([pt(0,0),pt(0,99)], pt(0,1)), "pt [0;1] should not be out zone [0;0][0;99]");

cutZoneWithLine(zone, bisector, BELOW);
assert(zone.length == 6, "Zone should have 6 vertices");
[A, B, C] = farest(zone, e, 3);
assert(A.round().equals(pt(2,3)) && B.round().equals(pt(5,5)) && C.round().equals(pt(2,7)), "farest points from [4;8] are wrong");
f = equiDistantPoint(A,B,C);
f.round();
assert(f.equals(pt(3,5)), "equidistant point (from farest points from [4;8]) is wrong");

zone2 = [pt(0,0),pt(0,15),pt(4,15),pt(4,0)];
avant = pt(1,5);
apres = pt(2,8);
bisector = perpendicularBisector(avant,apres);
''+cutZoneWithLine(zone2, bisector, avant.isBelow(bisector)? BELOW: ABOVE);

zone2 = [pt(0,10),pt(4,10),pt(0,12),pt(4,12)]
avant = pt(0,10);
apres = pt(2,11);
bisector = perpendicularBisector(avant,apres);
''+cutZoneWithLine(zone2, bisector, avant.isBelow(bisector)? BELOW: ABOVE);

zone2 = [pt(4,11),pt(4,10),pt(3,11),pt(3,12),pt(4,12)]
avant = pt(3,11);
apres = pt(4,11);
bisector = perpendicularBisector(avant,apres);
''+cutZoneWithLine(zone2, bisector, avant.isBelow(bisector)? BELOW: ABOVE);



zone2 = [pt(4,11),pt(4,10),pt(3,11),pt(3,12),pt(4,12)]
avant = pt(3,11);
apres = pt(4,11);
bisector = perpendicularBisector(avant,apres);
''+cutZoneWithLine(zone2, bisector, avant.isBelow(bisector)? BELOW: ABOVE);

zoneSquare = [pt(0,0),pt(23,0),pt(23,23),pt(0,23)];
avant = pt(22,13);
apres = pt(13,22);
bisector = perpendicularBisector(avant,apres);
''+cutZoneWithLine(zoneSquare, bisector, avant.isBelow(bisector)? BELOW: ABOVE);


zone2 = [pt(4,11),pt(4,10),pt(3,11),pt(3,12),pt(4,12)]
avant = pt(3,11);
apres = pt(4,11);
bisector = perpendicularBisector(avant,apres);
cutZoneWithLine(zone2, bisector, avant.isBelow(bisector)? BELOW: ABOVE);

zone3 = [pt(3,9),pt(2,7),pt(2,1),pt(4,0),pt(6,7),pt(4,9)];
assert(isOutOfZone(zone3, pt(7,2)), "[7;2] sould be out of Zone");
assert(isOutOfZone(zone3, pt(1,3)), "[1;3] sould not be out of Zone");
assert(isOutOfZone(zone3, pt(2,9)), "[2;9] sould not be out of Zone");
assert(!isOutOfZone(zone3, pt(4,8)), "[4;8] sould not be out of Zone");
assert(!isOutOfZone(zone3, pt(5,4)), "[5;4] sould not be out of Zone");

[I, J] = zoneIntersectionsWith(zone3, newLine(2, -2), BELOW);
assert(I.equals(pt(2,2)), "first intersection point between zone & line should be [2;2]");
assert(J.equals(pt(5,8)), "second intersection point between zone & line should be [5;8]");

G = gravityCenter(pt(0,2),pt(6,2),pt(6,6))
G.round();
assert(G.equals(pt(4,3)), "gravity center of [0;2]-[6;2]-[6;6] should be [4;3]")

lineZone = [pt(10,6),pt(6,4)];
p = nextPointOnSegment(lineZone[0], lineZone[1]);
assert(!isOutOfSegment(lineZone[0], lineZone[1], p), "next point after " + lineZone[0] + " should not be out of zone");
assert(!p.isRound(), "next point after " + lineZone[0] + " should not be round");
lineZone[0] = p;
p = nextPointOnSegment(lineZone[0], lineZone[1]);
assert(!isOutOfSegment(lineZone[0], lineZone[1], p), "next point (2) after " + lineZone[0] + " should not be out of zone");
assert(p.isRound(), "next point (2) after " + lineZone[0] + " should be round");
lineZone[0] = p;

verticalLineZone = [pt(4,4),pt(4,1)];
p = nextPointOnSegment(verticalLineZone[0], verticalLineZone[1]);
assert(!isOutOfSegment(verticalLineZone[0], verticalLineZone[1], p), "next point after " + verticalLineZone[0] + " should not be out of vertical zone");
assert(p.isRound(), "next point after " + verticalLineZone[0] + " on vertical line should be round");
assert(p.equals(pt(4,3)), "next point after " + verticalLineZone[0] + " on vertical line should be [4;3]");

horizontalLineZone = [pt(2,3),pt(7,3)];
p = nextPointOnSegment(horizontalLineZone[0], horizontalLineZone[1]);
assert(!isOutOfSegment(horizontalLineZone[0], horizontalLineZone[1], p), "next point after " + horizontalLineZone[0] + " should not be out of horizontal zone");
assert(p.isRound(), "next point after " + horizontalLineZone[0] + " on horizontal line should be round");
assert(p.equals(pt(3,3)), "next point after " + horizontalLineZone[0] + " on horizontal line should be [4;3]");

cutFirstOffLineZone(horizontalLineZone);
assert(horizontalLineZone[0].equals(pt(3,3)), "horizontal zone with first bound less, should start on " + pt(3,3));
assert(horizontalLineZone[1].equals(pt(7,3)), "horizontal zone with first bound less, should still end on " + pt(3,7));

cutLastOffLineZone(verticalLineZone);
assert(verticalLineZone[0].equals(pt(4,4)), "vertical zone with last bound less, should still start on " + pt(4,4));
assert(verticalLineZone[1].equals(pt(4,2)), "vertical zone with last bound less, should end on " + pt(4,2));

p = pt(4.5,7);
roundPointByVector(p, [pt(7,7),pt(2,7)]);
assert(p.equals(pt(4,7)), "point should be closer to " + pt(2,7));

p = pt(4.5,7);
roundPointByTarget(p, pt(7,7));
assert(p.equals(pt(5,7)), "point should be closer to " + pt(7,7));

p = pt(6,7);
movePointTowardsTarget(p, pt(8,11));
assert(p.x>6&&p.x<7&&p.y>7&&p.y<8, "moved point " + pt(6,7) + " towards " + pt(8,11) + " should be 6<x<7 ; 7<y<8");

p = pt(5,6);
movePointTowardsTarget(p, pt(5,11));
assert(p.equals(pt(5,7)), "moved point " + pt(5,6) + " towards " + pt(5,11) + " should be " + pt(5,7));

p = pt(18,1);
movePointTowardsTarget(p, pt(6,10), 5);
assert(p.equals(pt(14,4)), "moved point " + pt(18,1) + " towards " + pt(6,10) + " should be " + pt(14,4));

[A, B] = [pt(23,0),pt(23,23)];
projection = projectOnSegment(A, B, pt(25,12));
assert(projection.equals(pt(23,12)), "projection of " + pt(25,12) + " on " + A + "-" + B + " should be " + pt(23,12));

[A, B] = [pt(23,0),pt(23,10)];
projection = projectOnSegment(A, B, pt(25,12));
if (isOutOfSegment(A, B, projection)) {
    [projection] = nearest([A, B], projection, 1);
}
assert(projection.equals(B), "projection of " + pt(25,12) + " on " + A + "-" + B + " should be " + B);

[A, B, attented] = [pt(0,2), pt(3,5), 'pt(1,3),pt(2,4)'];
assert(getPointsBetween(A, B).toString() === attented, "points between "+A+" & "+B+" should be "+attented);
[A, B, attented] = [pt(0,5), pt(6,5), 'pt(1,5),pt(2,5),pt(3,5),pt(4,5),pt(5,5)'];
assert(getPointsBetween(A, B).toString() === attented, "points between "+A+" & "+B+" should be "+attented);
[A, B, attented] = [pt(4,2), pt(4,6), 'pt(4,3),pt(4,4),pt(4,5)'];
assert(getPointsBetween(A, B).toString() === attented, "points between "+A+" & "+B+" should be "+attented);
[A, B, attented] = [pt(0,1), pt(4,3), 'pt(1,2),pt(2,2),pt(3,3)'];
assert(getPointsBetween(A, B).map(p=>p.round()).toString() === attented, "points between "+A+" & "+B+" should be "+attented);
