/* global AFRAME, THREE, XRRigidTransform */
AFRAME.registerSystem("persistent-anchors", {
  schema: {
    target: { type: "selector" },
    targetAnchor: { type: "selector" },
  },
  init: function () {
    window.persistentAnchorsSystem = this;
    this.checkedAnchors = false;
    this.anchorEntity = document.getElementById("anchor");
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.matrix = new THREE.Matrix4();

    this.data.targetAnchor.addEventListener("loaded", (event) => {
      const { position, quaternion } = this.data.targetAnchor.object3D;
      this.matrixInverse = new THREE.Matrix4();
      this.matrixInverse.makeRotationFromQuaternion(quaternion);
      this.matrixInverse.setPosition(...position.toArray());
      this.matrixInverse.invert();
    });
  },
  tick: function () {
    this.renderer = this.el.sceneEl.renderer;
    if (this.renderer && !this.referenceSpace) {
      this.referenceSpace = this.renderer.xr.getReferenceSpace();
    }

    this.frame = this.el.sceneEl.frame;
    if (this.frame && this.referenceSpace) {
      this.session = this.frame.session;
      if (!this.checkedAnchors) {
        this.checkedAnchors = true;
        if (this.session.persistentAnchors) {
          let anchors = this.session.persistentAnchors;
          console.log("known anchor:");
          for (let i = 0; i < anchors.length; i++) {
            console.log(i + ": " + anchors[i]);
            this.frame.session.deletePersistentAnchor(anchors[i]);
          }
        }
        if (localStorage.anchor) {
          let uuid = localStorage.anchor;
          this.session
            .restorePersistentAnchor(uuid)
            .then((anchor) => {
              console.log("restored anchor");
              anchor.uuid = uuid;
              this.addAnchoredObjectToScene(anchor);
            })
            .catch((err) => console.log("failed to restore anchor: " + err));
        }
      }

      if (this.anchor && this._updateTransformFlag) {
        const anchorPose = this.frame.getPose(
          this.anchor.anchorSpace,
          this.referenceSpace
        );
        if (anchorPose) {
          const { orientation, position, matrix } = anchorPose.transform;
          this.anchorEntity.object3D.position.set(
            position.x,
            position.y,
            position.z
          );
          this.anchorEntity.object3D.quaternion.copy(orientation);
          this.anchorEntity.object3D.visible = true;

          this.matrix.fromArray(matrix).multiply(this.matrixInverse);
          this.data.target.object3D.position.setFromMatrixPosition(this.matrix);
          this.data.target.object3D.quaternion.setFromRotationMatrix(
            this.matrix
          );

          this._updateTransformFlag = false;
          console.log("updated");
        } else {
          this.anchorEntity.object3D.visible = false;
        }
      }

      const trackedAnchors = this.frame.trackedAnchors;
      if (trackedAnchors?.size > 0) {
        this.trackedAnchors = trackedAnchors;
      }
      trackedAnchors.forEach((anchor) => {
        //console.log("deleting anchor", anchor)
        //anchor.delete();
      });

      if (this._deleteAnchorFlag) {
        this._deleteAnchor();
        this._deleteAnchorFlag = null;
      }
      if (this._createAnchorFlag && !this.isDeletingAnchor) {
        this._createAnchor();
        this._createAnchorFlag = null;
      }
    }
  },

  createAnchor: function (position, quaternion) {
    console.log("create anchor");
    this.deleteAnchor();
    this._createAnchorFlag = { position, quaternion };
  },
  _createAnchor: async function () {
    //const frame = this.el.sceneEl.frame;
    let frame = this.sceneEl.renderer.xr.getFrame();
    const renderer = this.el.sceneEl.renderer;
    let referenceSpace = renderer.xr.getReferenceSpace();
    console.log(frame, renderer, referenceSpace);

    const { position, quaternion } = this._createAnchorFlag;
    this.euler.setFromQuaternion(quaternion);
    console.log(this.euler);
    this.euler.x = 0;
    this.euler.z = 0;
    quaternion.setFromEuler(this.euler);
    const anchorPose = new XRRigidTransform(position, quaternion);
    console.log("creating anchor");
    frame.createAnchor(anchorPose, referenceSpace).then(
      async (anchor) => {
        console.log("anchor", anchor);
        if (anchor.uuid === undefined) {
          const uuid = await anchor.requestPersistentHandle();
          console.log("anchor uuid: " + uuid);
          anchor.uuid = uuid;
          localStorage.anchor = uuid;
          this.addAnchoredObjectToScene(anchor);
        }
      },
      (error) => {
        console.error("Could not create anchor: " + error);
      }
    );
  },

  deleteAnchor: function () {
    this._deleteAnchorFlag = true;
  },
  _deleteAnchor: async function (anchor) {
    this.isDeletingAnchor = true;
    const frame = this.sceneEl.renderer.xr.getFrame();
    if (this.anchor) {
      console.log("removing persistant anchor");
      await frame.session.deletePersistentAnchor(this.anchor.uuid);
      await this.anchor.delete();
      delete this.anchor;
      localStorage.removeItem("anchor");
    }

    this.isDeletingAnchor = false;
  },

  addAnchoredObjectToScene: function (anchor) {
    this.anchor = anchor;
    this._updateTransformFlag = true;
  },
});
