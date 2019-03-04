<template>
  <div class="container">
    <div>
      <h5 class="text-center">{{title_string}}</h5>
      <form>
        <div v-if="suggestions.length">
          <h6>Questions that may answer your query:</h6>
          <div v-for="suggestion in suggestions">
            <router-link :to="{name: 'faq_detail', params: { id: suggestion.id }}">{{suggestion.title}}</router-link>
            <br/>
          </div>
          <br/>
        </div>
        <BaseInput placeholder="Question Title" v-model="form_data.question.title"
                   :valid="form_validity.title" @input="title_changed"></BaseInput>
        <div :class="form_validity.body == false ? 'has-danger': ''">
                    <textarea :class="form_validity.body == false ? 'form-control is-invalid': 'form-control'"
                              rows="3" placeholder="Question Body"
                              v-model="form_data.question.body"></textarea>
        </div>
        <br/>
        <BaseCheckbox v-model="form_data.question.anonymous" v-show="$store.state.userRole == 'student'">Ask Anonymously</BaseCheckbox>
        <br/>
        <div :class="form_validity.course == false ? 'is-invalid has-danger': ''">
          <v-select class="w100"
                    label="name"
                    :options="courses"
                    v-model="form_data.question.course"
                    placeholder="Course"></v-select>
        </div>
        <br/>
        <v-select class="w100"
                  label="name"
                  :options="tags"
                  v-model="form_data.tags"
                  multiple taggable placeholder="Tags"
                  v-b-tooltip.hover.top
                  title="select a tag or start typing and press enter to add a tag. (tags that dont already exist will be created when you submit the form)"></v-select>

        <br/>
        <br/>
        <div v-if="$store.state.userRole!='student'">
          <BaseInput :valid="form_validity.interest"
                     placeholder="Number of students showing interest"
                     input_type="number"
                     v-model="form_data.interest"></BaseInput>
          <div :class="form_validity.answer == false ? 'has-danger': ''">
                            <textarea
                                    :class="form_validity.answer == false ? 'form-control is-invalid': 'form-control'"
                                    rows="3"
                                    placeholder="Answer"
                                    v-model="form_data.answer"></textarea>
          </div>
        </div>
        <br/>
        <base-button block type="primary" v-on:click="submitForm">Submit</base-button>
      </form>
    </div>
  </div>
</template>
<script>
  import BaseInput from "../../components/BaseInput";
  import BaseCheckbox from "../../components/BaseCheckbox";
  import BTooltip from "bootstrap-vue/es/directives/tooltip/tooltip";

  export default {
    name: "faq_ask",
    components: {
      BaseInput,
      BaseCheckbox
    },
    directives: {
      BTooltip,
    },
    data() {
      return {
        courses: [],
        tags: [],
        form_validity: {
          title: null,
          body: null,
          course: null,
          interest: null,
          answer: null
        },
        form_data: {
          question: {
            title: "",
            body: "",
            anonymous: false,
            course: null,
            teaching_session_id: 1,
            course_id: 0
          },
          tags: [],
          interest: null,
          answer: null,
        },
        suggestions: [],
      }
    },
    mounted: function () {
      this.getOptions();
    },
    computed:{
      title_string: function () {
        return this.$store.state.userRole == "student" ? "Ask a Question" : "Add a Question";
      }
    },
    methods: {
      getOptions: function () {
        let v = this;
        this.axios.get("/api/courses").then(function (response) {
          v.courses = response.data;
        });
        this.axios.get("/api/topics").then(function (response) {
          v.tags = response.data;
        });
      },
      submitForm: function () {
        if (this.form_valid()) {
          this.form_data.question.course_id = this.form_data.question.course.id;
          let router = this.$router;
          this.axios.post("/api/questions", this.form_data).then(function (response) {
            router.push({name: "faq_detail", params: {id: response.data.id}})
          })
        } else {
          this.form_validity.title = this.form_data.question.title ? null : false;
          this.form_validity.body = this.form_data.question.body ? null : false;
          this.form_validity.course = this.form_data.question.course ? null : false;
          this.form_validity.interest = this.form_data.interest >= 0 ? null : false;
          this.form_validity.answer = this.form_data.answer ? null : false;
        }
      },
      form_valid: function () {
        let tutor_satisfied = (this.$store.state.userRole == "student" ||
          (parseInt(this.form_data.interest) >= 0 && this.form_data.answer != ""));
        return (this.form_data.question.title != "" &&
          this.form_data.question.body != "" &&
          this.form_validity.course != "" &&
          tutor_satisfied
        )
      },
      title_changed: function (new_title) {
        let self = this;
        if (new_title.length >= 3) {
          this.axios.get('/api/questions/search', {
              params: {search_string: new_title},
            }
          ).then(function (response) {
            self.suggestions = response.data;
          })
        }
      }
    },
  };
</script>
<style>
  .w100 {
    width: 100%;
  }
</style>