import { useGLTF } from '@react-three/drei';

export default function Cerebro() {
  const { scene } = useGLTF('./Cerebro.glb'); 
  
  return (
    <primitive object={scene} scale={2} />
  );
}