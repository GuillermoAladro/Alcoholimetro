"""Auditor 6-A: offline protocol tests, not hardware verification."""
from pathlib import Path
import argparse, ast,json,re,time
base=Path(__file__).resolve().parent
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--repo',type=Path)
ap.add_argument('--output',type=Path)
args=ap.parse_args()
candidates=[base/'Alcoholimetro',*base.parents]
repo=args.repo or next((p for p in candidates if (p/'componentes/winsen-ze29a/README.md').exists()),None)
if repo is None: ap.error('Supply --repo pointing to the audited repository')
md=(repo/'componentes/winsen-ze29a/README.md').read_text(encoding='utf-8')
code=re.search(r'```python\n(.*?)```',md,re.S).group(1)
module=ast.parse(code)
defs=ast.Module(body=[x for x in module.body if isinstance(x,ast.FunctionDef)],type_ignores=[])
ns={'time':time,'START':255,'ADDR':1}
exec(compile(defs,'readme_functions','exec'),ns)
class Port:
    def __init__(self,data,fragment=False): self.data=data; self.fragment=fragment
    def read(self,n):
        if self.fragment and n>1: n=3
        b,self.data=self.data[:n],self.data[n:]; return b

class ReferenceParser:
    """Bounded, incremental reference parser; no claim of production readiness."""
    def __init__(self): self.buf=bytearray()
    def feed(self,data):
        self.buf.extend(data); frames=[]
        while self.buf:
            try: start=self.buf.index(255)
            except ValueError:
                self.buf.clear(); break
            del self.buf[:start]
            if len(self.buf)<9: break
            frame=bytes(self.buf[:9])
            if sum(frame[1:])&255:
                del self.buf[0]
            else:
                frames.append(frame); del self.buf[:9]
        return frames

def read_frame_reference(ser,cmd=0x85,timeout=.02):
    parser=ReferenceParser(); deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        for frame in parser.feed(ser.read(9)):
            if frame[1]==cmd: return frame
    return None

examples=md.split('### Tramas de ejemplo del manual (todas comprobadas)')[1].split('Tramas que **no**')[0]
frames=[bytes.fromhex(x) for x in re.findall(r'`(FF(?: [0-9A-F]{2}){8})`',examples)]
valid=bytes.fromhex('FF 85 31 00 00 00 00 00 4A')
tests=[]
bad=valid[:-1]+b'\x4b'
wrong=bytes.fromhex('FF 88 04 00 00 00 00 00 74')
cases=[('valid',valid,False,valid),('non_FF_noise',b'\x00\x22'+valid,False,valid),('spurious_FF',b'\xff'+valid,False,valid),('fragmented_read',valid,True,valid),('checksum_corrupt',bad,False,None),('truncated',valid[:5],False,None),('corrupt_then_valid',bad+valid,False,valid),('wrong_command_then_valid',wrong+valid,False,valid)]
for name,data,frag,expected in cases:
    observed=ns['read_frame'](Port(data,frag),timeout=.02)
    # ask() in the original rejects any unexpected command after read_frame returns it.
    if observed is not None and observed[1]!=0x85: observed=None
    fixed=read_frame_reference(Port(data,frag))
    tests.append({'name':name,'input':data.hex(' '),'readme_frame':observed.hex(' ') if observed else None,'reference_frame':fixed.hex(' ') if fixed else None,'expected':expected.hex(' ') if expected else None,'readme_pass':observed==expected,'reference_pass':fixed==expected})
try:
    f=None
    value=(f[2]<<8)|f[3]
except TypeError as exc:
    missing_response_error=type(exc).__name__
results={'scope':'offline Python; fake serial. No sensor or Pi connected. Partial reads simulate a timeout before all 8 bytes are available; not ordinary fast UART packet splitting.','manual_frames_checked':len(frames),'manual_frames_valid':sum(ns['checksum'](f)==f[8] for f in frames),'warmup_command':ns['make'](0x87,0x32).hex(' '),'sample_result_raw':(0<<8)|0x5a,'serial_frame_duration_ms':9*10/9600*1000,'unprotected_missing_response':missing_response_error,'tests':tests,'readme_passes':sum(t['readme_pass'] for t in tests),'reference_passes':sum(t['reference_pass'] for t in tests)}
if args.output:
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
assert len(frames)==18 and results['manual_frames_valid']==18
assert results['warmup_command']=='ff 01 87 32 00 00 00 00 46'
assert all(t['reference_pass'] for t in tests)
