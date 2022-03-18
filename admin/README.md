#Arranger-project
In order to use Arranger, a project needs to be created. This project generates an extended mapping automatically
so that graphql queries can be constructed. However, arranger does not always get the mapping right for every field leading to some
incorrectly mapped fields (mapped a string instead of string[], for example), so it needs to be corrected.

Whether you need to create a new project from scratch or update an existing one, spin up arranger admin locally.

## Start Arranger-Admin
Make sure all your env vars are set accordingly to your needs (which ES instance you are targeting) and do:

`npm run start-admin`

That should start an admin instance and expose a [graphql playground](http://localhost:5050/admin/graphql) 

<i>Note: It is evident, but it is worth emphasising that changes you make locally will have an impact even if the elasticsearch instance is remote.</i>

## Create a project from scratch
Choose a name for your project and add it to the variable section of the playground.
Then, add these mutations (see clinMutations.txt for the graphql bits you need to copy-paste):

`
newProject, newIndexPatients, newIndexVariants
`

More explicitly copy-paste that to the playground and run it, 

```
mutation newProject($projectId: String!) {
    newProject(id: $projectId){
        id
        active
        timestamp
    }
}

... similarly for the other mutations ...

// in the variable section
{
 "projectId": "clin-yada-yada"
}
```

## Fix Arranger Extended Mapping
if you need to correct the mapping of a particular field, you do
```
mutation yourMutationNameForFieldX(
  $projectId: String!
  $yourVarForFieldX: ExtendedFieldMappingInput!
) {
  updateExtendedMapping(
    projectId: $projectId
    graphqlField: "Variants|Patients|Prescriptions|..."
    field: "thePathOfFieldXInEs"
    extendedFieldMappingInput: $yourVarForFieldX
  ) {
    field
    isArray
  }
}

// in the variable section
{
 "projectId": "clin-yada-yada",
 "yourVarForFieldX": {
      "unit" : null,
      "displayValues" : { },
      "quickSearchEnabled" : false,
      "displayName" : "Your display name",
      "active" : false,
      "isArray" : true,
      "rangeStep" : 1,
      "type" : "nested",
      "primaryKey" : false
  }
}
```
Document it in clinMutations.txt
# Creating a new Project that extends another one
Suppose new data is added in ES and you want to recreate the last project but enhance it with the new stuff.
1. Copy-paste all mutations in ClinMutations.txt in the graphql playground;
2. Verify that everything is in order before going further;
3. Add all the variables BUT make sure their values are correct for some may need an update such as `$projectId`;
4. Add new mutations if needed but make sure that they are added to clinMutations.txt as well for documenting purposes;
5. Run all mutations one-by-one.