import json
import numpy as np
import matplotlib.pyplot as plt
import math
with open('position.json') as f:
	data = json.load(f);
	
times = []
xvals = []
yvals = []
xvel = []
yvel = []
xacc = []
yacc = []

def moving_avg(arr, n):
	cumsum, moving_aves = [0], []
	for i, x in enumerate(arr, 1):
		cumsum.append(cumsum[i-1] + x) # cumsum[i] = sum of first i elements
		if i>=n:
			moving_average = float(cumsum[i] - cumsum[i-n])/n
			moving_aves.append(moving_average)
		else:
			moving_aves.append(float(cumsum[i])/i)
	return moving_aves
	
def calc_vel(pos, vel, time):
	prev_vel = 0
	new_vel = []
	change_index = 0
	buffer_size = 20
	for i in range(len(pos)):
		#print len(vel)
		#print vel[i]
		sign = math.copysign(1, vel[i])
		if vel[i]!= 0 and sign != prev_vel:
			change_index = i
			prev_vel = sign
			print "Change index at ", i
		if i==0:
			new_vel.append(0)
			continue
		nvel = float(pos[i] - pos[max(i - buffer_size, change_index)])/(times[i] - times[max(i-buffer_size, change_index)]+1)*100
		new_vel.append(nvel)
	#print new_vel
	return new_vel
for i in xrange(len(data)):
	x = data[i]["pos"]["x"]
	y = data[i]["pos"]["y"]
	time = data[i]["time"]
	xvals.append(x)
	yvals.append(y)
	times.append(time);
	if i != 0:
		xvel.append(float(xvals[i] - xvals[i-1])/(times[i] - times[i-1])*100)
		if i != 1:
			xacc.append((xvel[i] - xvel[i-1])/(times[i] - times[i-1])*100)
		else: 
			xacc.append(0)
	else:
		xvel.append(0)
		xacc.append(0)
times[:] = [x - times[0] for x in times]
xvals[:] = [x - xvals[0] for x in xvals]
#xvel = moving_avg(xvel, 1)
#xacc = moving_avg(xacc, 4)
plt.plot(times, xvals, c='r')
#plt.plot(times, xvel, c='g')
plt.plot(times, moving_avg(xvel, 4), c='b')
plt.plot(times, calc_vel(xvals, xvel, times), c='g')
plt.scatter(times, xvel)
plt.axhline(y=0, color='r', linestyle='-')
plt.show()