#!/usr/bin/python2


# this is a POC for keystrokes reading with python
# to run this with butterfly to see it work do the following (after you install butterfly)
# butterfly.server.py --shell="`pwd`/test_keypress.py" --unsecure

i = 0

def getchar():
    #Returns a single character from standard input
    import tty, termios, sys
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return ch

while i < 10:
    i += 1
    ch = getchar()
    print 'You pressed', repr(ch)