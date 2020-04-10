<template>
  <form class="m-5" @submit="post">
    <div class="p-3" v-if="notPushing">
      <ImageRow
        @click="imageClick"
        @close="imageToEdit = null"
        :key="amount"
        class="postImageRow"
        v-for="amount in Math.ceil(images.length / 3.0)"
        :images="images.slice((amount - 1) * 3, amount * 3)"
        :amount="amount"
      />
    </div>
    <EditImageModal
      @saveText="saveText"
      @swapL="swapL"
      @swapR="swapR"
      @remove="remove"
      :mobile="mobile"
    />
    <div v-if="uploading" class="progress mb-2">
      <div
        class="progress-bar progress-bar-striped progress-bar-animated"
        role="progressbar"
        :aria-valuenow="percent_done"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="'width: ' + percent_done + '%'"
      ></div>
    </div>
    <div class="form-row">
      <div class="col-12 mb-3">
        <div class="input-group">
          <div class="custom-file">
            <input
              type="file"
              @change="selectFile"
              accept="image/x-png,image/gif,image/jpeg"
              class="custom-file-input"
              id="inputGroupFile04"
            />
            <label class="custom-file-label" for="inputGroupFile04">{{
              selectedFile.name
            }}</label>
          </div>
          <div class="input-group-append">
            <button class="btn btn-outline-info" type="button" @click="upload">
              Hochladen!
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="form-row my-3">
      <div class="col-6">
        <DropboxChooser @addFromDropbox="addFromDropbox"></DropboxChooser>
      </div>
      <div class="col-6">
        <OnedriveChooser></OnedriveChooser>
      </div>
    </div>
    <div class="form-row mt-5">
      <div class="col-md-12 mb-3">
        <input
          type="text"
          class="form-control"
          v-model="title"
          placeholder="Titel"
          required
        />
      </div>
    </div>
    <div class="form-row">
      <div class="col-md-12 mb-3">
        <div class="form-group">
          <Editor v-model="text" :text="text"></Editor>
        </div>
      </div>
    </div>

    <div class="form-row  mt-5">
      <div class="col-lg my-2">
        <label for="tags">
          <i class="fas fa-tags"></i> Tags <br />
          <small>Enter, um Tag hinzuzufügen</small>
        </label>
        <Tags id="tags" required="required" pattern="^$" :tags="tags"></Tags>
      </div>
      <div class="col-lg my-2">
        <label for="date">
          <i class="fas fa-clock"></i> Datum <br />
          <small>in Desktop Safari: YYYY-MM-DD</small>
        </label>
        <input
          id="date"
          required="required"
          pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))"
          placeholder="YYYY-MM-DD"
          class="form-control"
          type="date"
          v-model="readableTimestamp"
        />
      </div>
    </div>
    <div class="form-row mb-3">
      <div class="col-lg">
        <label for="publicity"
          ><i class="fas fa-eye"></i> Sehbar von: <br /><small
            >(wer den Eintrag sehen kann)</small
          ></label
        >
        <select
          id="publicity"
          v-model="publicity"
          class="custom-select"
          name="publicity"
          required
        >
          <option value="">Bitte auswählen...</option>
          <option value="public">Öffentlich</option>
          <option value="other">Die Anderen</option>
          <option value="extended">Entfernetere Verwandschaft</option>
          <option value="close">Nähere Verwandschaft</option>
          <option value="family">Familie</option>
        </select>
      </div>
      <div class="col-lg">
        <label for="album"
          ><i class="fas fa-folder"></i> Album<br /><small
            >(wird erstellt, falls es noch nicht existiert)</small
          ></label
        >
        <input
          type="text"
          class="form-control"
          id="album"
          v-model="album"
          placeholder="Album"
        />
      </div>
    </div>
    <div class="form-row mb-3">
      <div class="col-lg">
        <div class="form-check">
          <input
            id="hide_author"
            class="form-check-input"
            type="checkbox"
            v-model="hide_author"
          />
          <label for="hide_author" class="form-check-label">
            <i class="fas fa-feather-alt"></i> Author verbergen
          </label>
        </div>
      </div>
      <div class="col-lg">
        <div class="form-check">
          <input
            id="hide_date"
            class="form-check-input"
            type="checkbox"
            v-model="hide_date"
          />
          <label for="hide_date" class="form-check-label">
            <i class="fas fa-calendar-alt"></i> Datum verbergen
          </label>
        </div>
        <small>Datum wird trotzdem zum Sortieren verwendet</small>
      </div>
    </div>
    <div class="form-row">
      <div class="col-md-12 mb-3">
        <button type="submit" class="btn btn-info">Eintragen!</button>
      </div>
    </div>
  </form>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import DropboxChooser from "../components/DropboxChooser";
import OnedriveChooser from "../components/OnedriveChooser";
import ImageRow from "../components/ImageRow";
import Tags from "../components/Tags";
import * as env from "../assets/env";
import Editor from "../components/Editor";
import EditImageModal from "../components/EditImageModal";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-info mr-1",
    cancelButton: "btn btn-secondary"
  },
  buttonsStyling: false
});

export default {
  name: "PostView.vue",
  components: {
    EditImageModal,
    Editor,
    Tags,
    ImageRow,
    DropboxChooser,
    OnedriveChooser
  },
  data: function() {
    return {
      id: "",
      editor: null,
      title: null,
      images: [],
      tags: [],
      text: "",
      publicity: "",
      timestamp: Date.now(),
      readableTimestamp: null,
      selectedFile: { name: "Bild auswählen" },
      uploading: false,
      percent_done: 0,
      album: "",
      hide_author: false,
      hide_date: false,
      notPushing: true,
      imageToEdit: null
    };
  },
  props: ["user", "mobile", "postToEdit"],
  watch: {
    readableTimestamp() {
      this.timestamp = new Date(this.readableTimestamp).getTime();
    }
  },
  methods: {
    async saveText(filename, text) {
      for (const image of this.images) {
        if (image.filename === filename) {
          image.text = text;
          break;
        }
      }
    },
    swapL(image) {
      const index = this.images.indexOf(image);
      if (index === 0) return;
      [this.images[index], this.images[index - 1]] = [
        this.images[index - 1],
        this.images[index]
      ];
      this.images.push({});
      this.images.pop();
    },
    swapR(image) {
      const index = this.images.indexOf(image);
      if (index >= this.images.length - 1) return;
      [this.images[index], this.images[index + 1]] = [
        this.images[index + 1],
        this.images[index]
      ];
      this.images.push({});
      this.images.pop();
    },
    remove(image) {
      this.images = this.images.filter(img => img.filename !== image.filename);
    },
    async imageClick(image) {
      this.$modal.show("EditImageModal", { image });
    },
    selectFile(event) {
      if (event.target.files.length === 1)
        this.selectedFile = event.target.files[0];
    },
    async addFromDropbox(files) {
      for (const file of files) {
        const src = file.link.replace("?dl=0", "?raw=1");

        let { data: newImage } = await axios.post(
          env.backend_url + "/importFromDropbox",
          { url: src, token: localStorage.getItem("token") }
        );
        if (
          !newImage.meta ||
          !newImage.meta.exif ||
          !newImage.meta.exif.ExifImageWidth ||
          !newImage.meta.exif.ExifImageHeight
        ) {
          newImage = { ...newImage, ...(await this.getMeta(src)) };
        } else {
          newImage.width = newImage.meta.exif.ExifImageWidth;
          newImage.height = newImage.meta.exif.ExifImageHeight;
        }
        this.notPushing = false;
        this.images.push(newImage);
        this.notPushing = true;
      }
    },
    upload() {
      if (!this.selectedFile.size) {
        return;
      }
      this.uploading = true;
      let formData = new FormData();
      formData.append("file", this.selectedFile);
      formData.append("token", localStorage.getItem("token"));
      axios
        .post(env.backend_url + "/upload", formData, {
          onUploadProgress: data => {
            this.percent_done = (data.loaded / data.total) * 100;
          }
        })
        .then(async ({ data }) => {
          const { valid, src, filename, thumbnail_url } = data;
          if (!valid) {
            //TODO
            return;
          }
          const image = {
            src,
            filename,
            thumbnail_url,
            ...(await this.getMeta(src))
          };
          this.notPushing = false;
          this.images.push(image);
          this.notPushing = true;
          this.selectedFile = { name: "Bild auswählen" };
          this.uploading = false;
          this.percent_done = 0;
        });
    },
    post(event) {
      event.preventDefault();

      if (this.uploading) {
        swalWithBootstrapButtons.fire(
          "Geduld!",
          "Bitte warte bis der Upload abgeschlossen ist",
          "error"
        );
        return;
      }
      const {
        title,
        images,
        tags,
        text,
        publicity,
        album,
        id,
        timestamp,
        hide_date,
        hide_author
      } = this;
      const post = {
        title,
        images,
        tags,
        text,
        publicity,
        album,
        id,
        timestamp,
        hide_date,
        hide_author,
        parent: localStorage.getItem("token")
      };
      axios.post(env.backend_url + "/post", post).then(({ data }) => {
        const { valid } = data;
        if (!valid) console.log("not valid...");
        else {
          swalWithBootstrapButtons.fire(
            "Erstellt!",
            "Beitrag wurde erstellt",
            "success"
          );
          this.$router.push("/");
        }
      });
    },
    getMeta(url) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve({ height: img.height, width: img.width });
        img.onerror = reject;
        img.src = url;
      });
    },
    dateToInputFormat(date) {
      return (
        date.getFullYear().toString() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, 0) +
        "-" +
        date
          .getDate()
          .toString()
          .padStart(2, 0)
      );
    }
  },
  created() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/");
    }
  },
  mounted() {
    if (!window.location.href.includes("?id=")) {
      this.readableTimestamp = this.dateToInputFormat(new Date());
    }
    this.id = window.location.href.split("?id=")[1];

    if (!(this.postToEdit && this.postToEdit._id === this.id)) return;

    for (const key in this.postToEdit) {
      this[key] = this.postToEdit[key];
    }
    if (this.postToEdit.timestamp) {
      this.readableTimestamp = this.dateToInputFormat(new Date(this.timestamp));
    }

    this.text += " ";
  }
};
</script>
