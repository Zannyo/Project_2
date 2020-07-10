var markers = [
  {
    location: [39.8283, -95.5795],
    key: "us",
    topArtist: "Juice WRLD"
  },
  {
    location: [-30.5595, 22.9375],
    key: "south africa",
    topArtist: "Drake"
  },
  {
    location: [-25.2744, 133.7751],
    key: "australia",
    topArtist: "Harry Styles"
  },
  {
    location: [-14.235, -51.9253],
    key: "brazil",
    topArtist: "Maralia Mendona§a"
  },
  {
    location: [14.0583, 108.2772],
    key: "vietnam",
    topArtist: "Bich Phuong"
  },
  {
    location: [46.8182, 8.2275],
    key: "switzerland",
    topArtist: "Capital Bra"
  }
];

let camera, scene, renderer, controls;
let material;
let clock;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 2);
  scene = new THREE.Scene();
  let light = new THREE.PointLight(0xffffff, 1, 100, 0);
  camera.add(light);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;
  clock = new THREE.Clock();
  onWindowResize();
  window.addEventListener("resize", onWindowResize, false);
  let tex = new THREE.TextureLoader().load(
    `ae904626-387a-478d-9f16-f8c56856131a_2_no_clouds_8k.jpg`
  );
  let bump = new THREE.TextureLoader().load(
    `ae904626-387a-478d-9f16-f8c56856131a_earthbump1k.jpg`
  );
  let sphr = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({
      color: "white",
      map: tex,
      bumpMap: bump,
      bumpScale: 0.01,
      wireframe: false
    })
  );
  scene.add(sphr);

  function longLatToVector(lng, lat, out) {
    lng = (lng * Math.PI) / 180 + Math.PI * 0.5;
    lat = (lat * Math.PI) / 180;
    out = out || new THREE.Vector3();
    //flips the Y axis
    lat = Math.PI / 2 - lat;
    //distribute to sphere
    out.set(
      Math.sin(lat) * Math.sin(lng),
      Math.cos(lat),
      Math.sin(lat) * Math.cos(lng)
    );
    return out;
  }

  var loader = new THREE.FontLoader();
  let tbox = new THREE.Box3();

  let txtmat = new THREE.MeshStandardMaterial({color:0xffffff});
  let txtmat1 = new THREE.MeshStandardMaterial({color:0xc0d0ff});
  let maketext = (text, font, sz = 0.09,material = txtmat) => {
    var geometry = new THREE.TextGeometry(text, {
      font: font,
      size: sz,
      height: sz * 0.1,
      curveSegments: 7,
      bevelEnabled: true,
      bevelThickness: sz * 0.01,
      bevelSize: sz * 0.01,
      bevelOffset: 0,
      bevelSegments: 1
    });
    let tm = new THREE.Mesh(geometry, material);
    tbox.setFromObject(tm);
    tbox.getCenter(tm.position).multiplyScalar(-1);
    return tm;
  };

  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function(font) {
      for (let i = 0; i < markers.length; i++) {
        let m = markers[i];
        let point = longLatToVector(m.location[1], m.location[0]);
        let troot = new THREE.Object3D();
        troot.position.copy(point);
        point.multiplyScalar(2);
        troot.lookAt(point);
        scene.add(troot);

        let tm = maketext(m.key, font);
        let tm1 = maketext(m.topArtist, font, 0.06,txtmat1);

        tm.position.y += 0.07;
        troot.add(tm);
        tm1.position.y -= 0.07;
        troot.add(tm1);
      }
    }
  );
}

function onWindowResize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}
