{
  "targets": [
    {
      "target_name": "zkfp",
      "sources": [ "zkfp.cc" ],
      "include_dirs": [
        "include"
      ],
      "libraries": [ 
        "../x64lib/libzkfp.lib",
        "../x86lib/libzkfp.lib"
      ]
    }
  ]
}